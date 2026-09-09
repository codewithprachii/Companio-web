from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    Assessment,
    ScreeningSession,
    PatientProfile,
)
from app.schemas import AssessmentOut

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.post("/generate/{session_id}", response_model=AssessmentOut, status_code=201)
async def generate_assessment(session_id: int, db: AsyncSession = Depends(get_db)):
    session = (
        await db.execute(
            select(ScreeningSession)
            .where(ScreeningSession.id == session_id)
        )
    ).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    existing = (
        await db.execute(select(Assessment).where(Assessment.session_id == session_id))
    ).scalar_one_or_none()
    if existing:
        return existing

    raise HTTPException(
        status_code=400,
        detail="No assessment exists for this session. Complete the screening session first.",
    )


@router.get("/patient/{patient_id}", response_model=list[AssessmentOut])
async def patient_assessments(patient_id: int, db: AsyncSession = Depends(get_db)):
    profile = await db.get(PatientProfile, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")

    result = await db.execute(
        select(Assessment)
        .where(Assessment.patient_id == patient_id)
        .order_by(Assessment.generated_at.desc())
    )
    return result.scalars().all()


@router.get("/{assessment_id}", response_model=AssessmentOut)
async def get_assessment(assessment_id: int, db: AsyncSession = Depends(get_db)):
    assessment = await db.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment
