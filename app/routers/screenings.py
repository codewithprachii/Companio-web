from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import (
    PatientProfile,
    ScreeningQuestion,
    ScreeningSession,
    ScreeningResponse,
    ScreeningStatus,
    Assessment,
    PatientEvent,
    EventType,
)
from app.schemas import (
    StartScreeningRequest,
    ScreeningQuestionOut,
    ScreeningSessionOut,
    RespondRequest,
    AssessmentOut,
)
from app import scoring

router = APIRouter(prefix="/api/screenings", tags=["screenings"])


@router.get("/questions", response_model=list[ScreeningQuestionOut])
async def list_questions(
    type: str | None = Query(None, description="Filter by question type, e.g. 'frequency'"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ScreeningQuestion).order_by(ScreeningQuestion.id)
    if type:
        stmt = stmt.where(ScreeningQuestion.type == type)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/start", response_model=ScreeningSessionOut, status_code=201)
async def start_screening(payload: StartScreeningRequest, db: AsyncSession = Depends(get_db)):
    profile = await db.get(PatientProfile, payload.patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")

    session = ScreeningSession(patient_id=payload.patient_id, status=ScreeningStatus.in_progress)
    db.add(session)
    await db.commit()

    session = (
        await db.execute(
            select(ScreeningSession)
            .options(selectinload(ScreeningSession.responses))
            .where(ScreeningSession.id == session.id)
        )
    ).scalar_one()
    return session


@router.post("/{session_id}/respond", response_model=ScreeningSessionOut)
async def respond(
    session_id: int,
    payload: RespondRequest,
    db: AsyncSession = Depends(get_db),
):
    session = (
        await db.execute(
            select(ScreeningSession)
            .options(selectinload(ScreeningSession.responses))
            .where(ScreeningSession.id == session_id)
        )
    ).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == ScreeningStatus.completed:
        raise HTTPException(status_code=400, detail="Session is already completed")

    question = await db.get(ScreeningQuestion, payload.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Determine scored value
    if payload.is_correct is not None:
        response_value = question.max_score if payload.is_correct else 0.0
    elif payload.response_value is not None:
        response_value = payload.response_value
    else:
        response_value = scoring.grade_response(question, None, payload.response_text)

    resp = ScreeningResponse(
        session_id=session_id,
        question_id=question.id,
        domain=question.domain,
        response_text=payload.response_text,
        response_value=response_value,
        is_correct=payload.is_correct,
        time_taken_seconds=payload.time_taken_seconds,
    )
    db.add(resp)
    await db.commit()

    session = (
        await db.execute(
            select(ScreeningSession)
            .options(selectinload(ScreeningSession.responses))
            .where(ScreeningSession.id == session_id)
        )
    ).scalar_one()
    return session


@router.post("/{session_id}/complete", response_model=AssessmentOut)
async def complete_screening(session_id: int, db: AsyncSession = Depends(get_db)):
    session = (
        await db.execute(
            select(ScreeningSession)
            .options(selectinload(ScreeningSession.responses).selectinload(ScreeningResponse.question))
            .where(ScreeningSession.id == session_id)
        )
    ).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status == ScreeningStatus.completed:
        existing = (
            await db.execute(select(Assessment).where(Assessment.session_id == session_id))
        ).scalar_one_or_none()
        if existing:
            return existing
        raise HTTPException(status_code=400, detail="Session already completed without assessment")

    # Mark completed
    session.status = ScreeningStatus.completed
    now = datetime.utcnow()
    session.completed_at = now
    delta = now - session.started_at
    session.total_time_seconds = int(delta.total_seconds())

    # Compute assessment via scoring engine
    assessment_data = scoring.compute_assessment(
        session, list(session.responses)
    )

    assessment = Assessment(
        session_id=session_id,
        patient_id=session.patient_id,
        cognitive_score=assessment_data["cognitive_score"],
        max_score=assessment_data["max_score"],
        risk_category=assessment_data["risk_category"],
        domain_scores=assessment_data["domain_scores"],
        key_observations=assessment_data["key_observations"],
        areas_requiring_attention=assessment_data["areas_requiring_attention"],
        suggested_next_steps=assessment_data["suggested_next_steps"],
        disclaimer=assessment_data["disclaimer"],
    )
    db.add(assessment)

    # Log patient event
    event = PatientEvent(
        patient_id=session.patient_id,
        event_type=EventType.assessment,
        description=f"Cognitive screening completed. Score {assessment.cognitive_score}/30, "
        f"risk: {assessment.risk_category.value}.",
    )
    db.add(event)
    await db.commit()
    await db.refresh(assessment)
    return assessment


@router.get("/{session_id}", response_model=ScreeningSessionOut)
async def get_session(session_id: int, db: AsyncSession = Depends(get_db)):
    session = (
        await db.execute(
            select(ScreeningSession)
            .options(selectinload(ScreeningSession.responses))
            .where(ScreeningSession.id == session_id)
        )
    ).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
