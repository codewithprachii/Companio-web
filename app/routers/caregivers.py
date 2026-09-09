from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import (
    PatientProfile,
    PatientObservation,
    Assessment,
    Reminder,
    User,
    UserRole,
)
from app.schemas import (
    PatientProfileOut,
    ObservationCreate,
    ObservationOut,
    AlertOut,
)

router = APIRouter(prefix="/api/caregivers", tags=["caregivers"])


@router.get("/patients", response_model=list[PatientProfileOut])
async def caregiver_patients(
    caregiver_user_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PatientProfile)
        .options(selectinload(PatientProfile.user), selectinload(PatientProfile.caregiver))
    )
    if caregiver_user_id is not None:
        stmt = stmt.where(PatientProfile.caregiver_id == caregiver_user_id)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/observations", response_model=ObservationOut, status_code=201)
async def record_observation(payload: ObservationCreate, db: AsyncSession = Depends(get_db)):
    profile = await db.get(PatientProfile, payload.patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")

    observation = PatientObservation(
        patient_id=payload.patient_id,
        caregiver_id=payload.caregiver_id,
        observation_text=payload.observation_text,
        category=payload.category,
        severity=payload.severity,
    )
    db.add(observation)
    await db.commit()
    await db.refresh(observation)
    return observation


@router.get("/observations/{patient_id}", response_model=list[ObservationOut])
async def patient_observations(patient_id: int, db: AsyncSession = Depends(get_db)):
    profile = await db.get(PatientProfile, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")
    result = await db.execute(
        select(PatientObservation)
        .where(PatientObservation.patient_id == patient_id)
        .order_by(PatientObservation.recorded_at.desc())
    )
    return result.scalars().all()


@router.get("/alerts", response_model=list[AlertOut])
async def caregiver_alerts(
    caregiver_user_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PatientProfile)
        .options(selectinload(PatientProfile.user))
    )
    if caregiver_user_id is not None:
        stmt = stmt.where(PatientProfile.caregiver_id == caregiver_user_id)
    result = await db.execute(stmt)
    patients = result.scalars().all()

    alerts = []
    from datetime import datetime

    for p in patients:
        latest = (
            await db.execute(
                select(Assessment)
                .where(Assessment.patient_id == p.id)
                .order_by(Assessment.generated_at.desc())
                .limit(1)
            )
        ).scalar_one_or_none()

        if latest and latest.risk_category.value == "high":
            alerts.append(
                AlertOut(
                    patient_id=p.id,
                    patient_name=p.user.name,
                    risk_category=latest.risk_category,
                    message="High cognitive risk detected. Urgent clinical review recommended.",
                    severity="critical",
                    created_at=latest.generated_at,
                )
            )
        elif latest and latest.risk_category.value == "moderate":
            alerts.append(
                AlertOut(
                    patient_id=p.id,
                    patient_name=p.user.name,
                    risk_category=latest.risk_category,
                    message="Moderate cognitive risk. Schedule follow-up screening.",
                    severity="warning",
                    created_at=latest.generated_at,
                )
            )

        # Missed/overdue reminders
        now = datetime.utcnow()
        overdue = (
            await db.execute(
                select(Reminder)
                .where(
                    and_(
                        Reminder.patient_id == p.id,
                        Reminder.is_completed == False,
                        Reminder.scheduled_at < now,
                    )
                )
            )
        ).scalars().all()
        for rem in overdue[:2]:
            alerts.append(
                AlertOut(
                    patient_id=p.id,
                    patient_name=p.user.name,
                    risk_category=latest.risk_category if latest else None,
                    message=f"Overdue reminder: {rem.title}",
                    severity="warning",
                    created_at=rem.scheduled_at,
                )
            )

    return alerts
