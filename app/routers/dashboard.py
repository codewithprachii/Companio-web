from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import (
    PatientProfile,
    Assessment,
    Reminder,
    User,
)
from app.schemas import (
    DashboardStats,
    AlertOut,
    PatientTrends,
    TrendPoint,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(db: AsyncSession = Depends(get_db)):
    total_patients = (
        await db.execute(select(func.count(PatientProfile.id)))
    ).scalar_one()

    recent_assessments = (
        await db.execute(
            select(func.count(Assessment.id)).where(
                Assessment.generated_at >= datetime.utcnow() - timedelta(days=30)
            )
        )
    ).scalar_one()

    # Determine risk distribution from latest assessment per patient
    patients = (await db.execute(select(PatientProfile.id))).scalars().all()
    high = moderate = low = 0
    for pid in patients:
        latest = (
            await db.execute(
                select(Assessment)
                .where(Assessment.patient_id == pid)
                .order_by(Assessment.generated_at.desc())
                .limit(1)
            )
        ).scalar_one_or_none()
        if latest:
            if latest.risk_category.value == "high":
                high += 1
            elif latest.risk_category.value == "moderate":
                moderate += 1
            else:
                low += 1

    total_reminders = (await db.execute(select(func.count(Reminder.id)))).scalar_one()
    upcoming = (
        await db.execute(
            select(func.count(Reminder.id)).where(
                Reminder.is_completed == False,
                Reminder.scheduled_at >= datetime.utcnow(),
            )
        )
    ).scalar_one()

    # Pending follow-ups approximated: patients with high/moderate risk without
    # a follow-up scheduled, or assessments flagged high.
    pending_follow_ups = high + moderate

    return DashboardStats(
        total_patients=total_patients,
        recent_assessments=recent_assessments,
        high_risk_cases=high,
        moderate_risk_cases=moderate,
        low_risk_cases=low,
        pending_follow_ups=pending_follow_ups,
        total_reminders=total_reminders,
        upcoming_reminders=upcoming,
    )


@router.get("/alerts", response_model=list[AlertOut])
async def dashboard_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientProfile).options(selectinload(PatientProfile.user))
    )
    patients = result.scalars().all()

    alerts = []
    for p in patients:
        latest = (
            await db.execute(
                select(Assessment)
                .where(Assessment.patient_id == p.id)
                .order_by(Assessment.generated_at.desc())
                .limit(1)
            )
        ).scalar_one_or_none()
        if not latest:
            alerts.append(
                AlertOut(
                    patient_id=p.id,
                    patient_name=p.user.name,
                    risk_category=None,
                    message="No cognitive screening on record. Initial assessment recommended.",
                    severity="info",
                    created_at=datetime.utcnow(),
                )
            )
            continue
        if latest.risk_category.value == "high":
            alerts.append(
                AlertOut(
                    patient_id=p.id,
                    patient_name=p.user.name,
                    risk_category=latest.risk_category,
                    message=f"High cognitive risk (score {latest.cognitive_score}/30). Urgent clinical review needed.",
                    severity="critical",
                    created_at=latest.generated_at,
                )
            )
        elif latest.risk_category.value == "moderate":
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

    alerts.sort(key=lambda a: ("critical" != a.severity, "warning" != a.severity, a.created_at))
    return alerts


@router.get("/trends", response_model=list[PatientTrends])
async def dashboard_trends(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientProfile).options(selectinload(PatientProfile.user))
    )
    patients = result.scalars().all()

    trends = []
    for p in patients:
        assessments = (
            await db.execute(
                select(Assessment)
                .where(Assessment.patient_id == p.id)
                .order_by(Assessment.generated_at.asc())
            )
        ).scalars().all()
        if not assessments:
            continue
        trends.append(
            PatientTrends(
                patient_id=p.id,
                patient_name=p.user.name,
                trend=[
                    TrendPoint(
                        assessment_id=a.id,
                        cognitive_score=a.cognitive_score,
                        risk_category=a.risk_category,
                        generated_at=a.generated_at,
                    )
                    for a in assessments
                ],
            )
        )
    return trends
