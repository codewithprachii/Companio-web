from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import (
    User,
    UserRole,
    PatientProfile,
    CaregiverProfile,
    Assessment,
    ScreeningSession,
)
from app.schemas import (
    PatientRegister,
    PatientProfileOut,
    AssessmentOut,
)

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("/register", response_model=PatientProfileOut, status_code=201)
async def register_patient(payload: PatientRegister, db: AsyncSession = Depends(get_db)):
    # Create the patient user
    patient_user = User(
        name=payload.name,
        role=UserRole.patient,
        email=payload.email,
        phone=payload.phone,
    )
    db.add(patient_user)
    await db.flush()

    # Create or link caregiver
    caregiver_id = None
    if payload.caregiver_name:
        caregiver_user = User(
            name=payload.caregiver_name,
            role=UserRole.caregiver,
            phone=payload.caregiver_phone,
        )
        db.add(caregiver_user)
        await db.flush()
        caregiver_profile = CaregiverProfile(
            user_id=caregiver_user.id,
            relation_role=payload.caregiver_relationship,
            emergency_contact=payload.caregiver_phone,
        )
        db.add(caregiver_profile)
        caregiver_id = caregiver_user.id

    profile = PatientProfile(
        user_id=patient_user.id,
        age=payload.age,
        gender=payload.gender,
        region=payload.region,
        address=payload.address,
        medical_history=payload.medical_history,
        existing_conditions=payload.existing_conditions,
        medications=payload.medications,
        caregiver_id=caregiver_id,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile, attribute_names=["user", "caregiver"])
    return profile


@router.get("/", response_model=list[PatientProfileOut])
async def list_patients(
    search: str | None = Query(None, description="Search by patient name"),
    risk_category: str | None = Query(None, description="Filter by risk: low/moderate/high"),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PatientProfile)
        .options(selectinload(PatientProfile.user), selectinload(PatientProfile.caregiver))
    )
    if search:
        stmt = stmt.join(User, PatientProfile.user_id == User.id).where(
            or_(User.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%"))
        )
    result = await db.execute(stmt)
    profiles = result.scalars().unique().all()

    # Attach latest assessment for each profile
    out_profiles = []
    for p in profiles:
        latest = (
            await db.execute(
                select(Assessment)
                .where(Assessment.patient_id == p.id)
                .order_by(Assessment.generated_at.desc())
                .limit(1)
            )
        ).scalar_one_or_none()
        p.latest_assessment = latest
        if risk_category and (latest is None or latest.risk_category.value != risk_category):
            continue
        out_profiles.append(p)

    return out_profiles


@router.get("/{patient_id}", response_model=PatientProfileOut)
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db)):
    profile = (
        await db.execute(
            select(PatientProfile)
            .options(selectinload(PatientProfile.user), selectinload(PatientProfile.caregiver))
            .where(PatientProfile.id == patient_id)
        )
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")

    latest = (
        await db.execute(
            select(Assessment)
            .where(Assessment.patient_id == patient_id)
            .order_by(Assessment.generated_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()
    profile.latest_assessment = latest
    return profile


@router.get("/{patient_id}/history", response_model=list[AssessmentOut])
async def get_assessment_history(patient_id: int, db: AsyncSession = Depends(get_db)):
    profile = await db.get(PatientProfile, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")

    result = await db.execute(
        select(Assessment)
        .where(Assessment.patient_id == patient_id)
        .order_by(Assessment.generated_at.desc())
    )
    return result.scalars().all()


@router.put("/{patient_id}", response_model=PatientProfileOut)
async def update_patient(
    patient_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    profile = await db.get(PatientProfile, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")

    for field, value in payload.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile, attribute_names=["user", "caregiver"])
    return profile
