"""
Seed data for Companio prototype. Populates realistic sample patients,
caregivers, healthcare workers, screening sessions, assessments,
observations, and reminders.
"""

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    User,
    UserRole,
    PatientProfile,
    CaregiverProfile,
    ScreeningQuestion,
    ScreeningSession,
    ScreeningResponse,
    ScreeningStatus,
    Assessment,
    PatientObservation,
    Reminder,
    ReminderType,
    PatientEvent,
    EventType,
    ObservationCategory,
)
from app.question_data import DEFAULT_QUESTIONS
from app import scoring


async def seed_question_bank(db: AsyncSession):
    existing = (await db.execute(select(ScreeningQuestion))).scalars().all()
    if existing:
        return
    for q in DEFAULT_QUESTIONS:
        db.add(ScreeningQuestion(**q))
    await db.flush()


async def seed_frequency_bank(db: AsyncSession):
    """Insert the self-report frequency questions if the old bank is present.

    INSERT-only migration so existing screens/responses linked to the earlier
    evaluator-style questions are not deleted (avoids orphaned foreign keys on
    a populated database). Safe to call repeatedly.
    """
    frequency_question = (
        await db.execute(
            select(ScreeningQuestion).where(ScreeningQuestion.type == "frequency")
        )
    ).scalars().first()
    if frequency_question:
        return
    for q in DEFAULT_QUESTIONS:
        db.add(ScreeningQuestion(**q))
    await db.commit()


async def _build_patient(
    db,
    name,
    age,
    gender,
    region,
    medical_history,
    conditions,
    medications,
    caregiver_name,
    caregiver_phone,
    caregiver_rel,
    answers,
):
    """Creates a patient with caregiver, screenings and assessments.
    Returns (profile, caregiver_user, caregiver_profile).
    """
    caregiver_user = User(
        name=caregiver_name,
        role=UserRole.caregiver,
        phone=caregiver_phone,
    )
    db.add(caregiver_user)
    await db.flush()
    caregiver_profile = CaregiverProfile(
        user_id=caregiver_user.id,
        relation_role=caregiver_rel,
        emergency_contact=caregiver_phone,
    )
    db.add(caregiver_profile)

    patient_user = User(
        name=name,
        role=UserRole.patient,
        phone=None,
    )
    db.add(patient_user)
    await db.flush()

    profile = PatientProfile(
        user_id=patient_user.id,
        age=age,
        gender=gender,
        region=region,
        medical_history=medical_history,
        existing_conditions=conditions,
        medications=medications,
        caregiver_id=caregiver_user.id,
    )
    db.add(profile)
    await db.flush()

    questions = (await db.execute(select(ScreeningQuestion))).scalars().all()

    for round_idx, answerset in enumerate(answers):
        started = datetime.utcnow() - timedelta(days=(30 * (len(answers) - round_idx)))
        session = ScreeningSession(
            patient_id=profile.id,
            status=ScreeningStatus.completed,
            started_at=started,
        )
        session.completed_at = started + timedelta(minutes=12)
        session.total_time_seconds = 720
        db.add(session)
        await db.flush()

        for qi, q in enumerate(questions):
            val = answerset[qi] if qi < len(answerset) else 1.0
            val = float(val)
            resp = ScreeningResponse(
                session_id=session.id,
                question_id=q.id,
                domain=q.domain,
                response_value=val,
                is_correct=(val >= q.max_score * 0.9),
            )
            db.add(resp)
        await db.flush()

        loaded = (
            await db.execute(
                select(ScreeningSession)
                .options(
                    selectinload(ScreeningSession.responses).selectinload(
                        ScreeningResponse.question
                    )
                )
                .where(ScreeningSession.id == session.id)
            )
        ).scalar_one()

        data = scoring.compute_assessment(loaded, list(loaded.responses))
        assessment = Assessment(
            session_id=session.id,
            patient_id=profile.id,
            cognitive_score=data["cognitive_score"],
            max_score=data["max_score"],
            risk_category=data["risk_category"],
            domain_scores=data["domain_scores"],
            key_observations=data["key_observations"],
            areas_requiring_attention=data["areas_requiring_attention"],
            suggested_next_steps=data["suggested_next_steps"],
            disclaimer=data["disclaimer"],
            generated_at=session.completed_at,
        )
        db.add(assessment)
        db.add(
            PatientEvent(
                patient_id=profile.id,
                event_type=EventType.assessment,
                description=(
                    f"Screening completed. Score {data['cognitive_score']}/30, "
                    f"risk {data['risk_category'].value}."
                ),
                recorded_at=session.completed_at,
            )
        )
        await db.flush()

    return profile, caregiver_user, caregiver_profile


async def seed(db: AsyncSession):
    await seed_question_bank(db)

    existing = (await db.execute(select(User))).scalars().all()
    if existing:
        return

    # Patient A: low risk
    p1, cu1, cg1 = await _build_patient(
        db,
        name="Joseph Kamau", age=68, gender="male", region="Kitui, Kenya",
        medical_history="Hypertension controlled with medication. No prior head injury.",
        conditions=["Hypertension"],
        medications=["Amlodipine 5mg daily"],
        caregiver_name="Mary Kamau", caregiver_phone="+254711000001", caregiver_rel="Wife",
        answers=[
            [4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 3],
            [4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 3],
        ],
    )

    # Patient B: moderate risk, declining
    p2, cu2, cg2 = await _build_patient(
        db,
        name="Amina Ochieng", age=74, gender="female", region="Kisumu, Kenya",
        medical_history="Type 2 diabetes. Reported forgetfulness over the past year.",
        conditions=["Type 2 Diabetes", "Mild Hypertension"],
        medications=["Metformin 850mg twice daily", "Lisinopril 10mg daily"],
        caregiver_name="Samuel Ochieng", caregiver_phone="+254722000002", caregiver_rel="Son",
        answers=[
            [3, 3, 4, 4, 3, 3, 4, 3, 2, 3, 3, 3, 3, 3, 2],
            [2, 3, 3, 3, 3, 2, 3, 2, 2, 3, 3, 3, 2, 2, 1],
        ],
    )

    # Patient C: high risk, clear decline
    p3, cu3, cg3 = await _build_patient(
        db,
        name="Peter Njoroge", age=81, gender="male", region="Nakuru, Kenya",
        medical_history=(
            "History of stroke 4 years ago. Progressive memory loss, confusion, wandering."
        ),
        conditions=["Post-stroke", "Dementia (suspected)", "Hypertension"],
        medications=["Aspirin 75mg daily", "Atorvastatin 20mg daily", "Donepezil 5mg"],
        caregiver_name="Alice Njoroge", caregiver_phone="+254733000003", caregiver_rel="Daughter",
        answers=[
            [1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        ],
    )

    # Observations
    db.add_all([
        PatientObservation(
            patient_id=p2.id, caregiver_id=cg2.id, category=ObservationCategory.cognitive,
            observation_text="Forgot how to get to the market today even though we go weekly.",
            severity="moderate",
        ),
        PatientObservation(
            patient_id=p2.id, caregiver_id=cg2.id, category=ObservationCategory.behavioral,
            observation_text="Repeated the same question about dinner several times.",
            severity="mild",
        ),
        PatientObservation(
            patient_id=p3.id, caregiver_id=cg3.id, category=ObservationCategory.behavioral,
            observation_text="Wandered out of the house at night. Found him down the road confused.",
            severity="severe",
        ),
        PatientObservation(
            patient_id=p3.id, caregiver_id=cg3.id, category=ObservationCategory.physical,
            observation_text="Difficulty eating without assistance; appears disoriented in the evening.",
            severity="severe",
        ),
        PatientObservation(
            patient_id=p1.id, caregiver_id=cg1.id, category=ObservationCategory.cognitive,
            observation_text="No notable concerns this week. Managing daily routines well.",
            severity="none",
        ),
    ])

    # Reminders
    now = datetime.utcnow()
    db.add_all([
        Reminder(
            patient_id=p1.id, created_by_id=cg1.id, reminder_type=ReminderType.medication,
            title="Morning blood pressure medication",
            description="Amlodipine 5mg with breakfast.",
            scheduled_at=now + timedelta(hours=8),
            is_completed=False,
        ),
        Reminder(
            patient_id=p2.id, created_by_id=cg2.id, reminder_type=ReminderType.medication,
            title="Evening metformin dose",
            description="Metformin 850mg with dinner.",
            scheduled_at=now + timedelta(hours=10),
            is_completed=False,
        ),
        Reminder(
            patient_id=p2.id, created_by_id=cg2.id, reminder_type=ReminderType.appointment,
            title="Follow-up cognitive screening",
            description="Book follow-up screening with caregiver support.",
            scheduled_at=now + timedelta(days=14),
            is_completed=False,
        ),
        Reminder(
            patient_id=p3.id, created_by_id=cg3.id, reminder_type=ReminderType.medication,
            title="Morning pills",
            description="Aspirin, Atorvastatin, Donepezil with breakfast.",
            scheduled_at=now + timedelta(hours=5),
            is_completed=False,
        ),
        Reminder(
            patient_id=p3.id, created_by_id=cg3.id, reminder_type=ReminderType.follow_up,
            title="Urgent clinical review",
            description="Refer to specialist for safety assessment after wandering episode.",
            scheduled_at=now + timedelta(days=3),
            is_completed=False,
        ),
    ])

    await db.commit()
