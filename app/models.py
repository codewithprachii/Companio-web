from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base

import enum


class UserRole(str, enum.Enum):
    patient = "patient"
    caregiver = "caregiver"
    health_worker = "health_worker"


class RiskCategory(str, enum.Enum):
    low = "low"
    moderate = "moderate"
    high = "high"


class ScreeningStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"


class ReminderType(str, enum.Enum):
    medication = "medication"
    appointment = "appointment"
    follow_up = "follow_up"


class ObservationCategory(str, enum.Enum):
    behavioral = "behavioral"
    cognitive = "cognitive"
    physical = "physical"


class EventType(str, enum.Enum):
    screening = "screening"
    assessment = "assessment"
    followup = "followup"
    incident = "incident"
    medication = "medication"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    email = Column(String(120), unique=True, nullable=True)
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient_profile = relationship(
        "PatientProfile",
        back_populates="user",
        uselist=False,
        foreign_keys="PatientProfile.user_id",
    )
    caregiver_profile = relationship(
        "CaregiverProfile", back_populates="user", uselist=False
    )


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=True)
    region = Column(String(120), nullable=True)
    address = Column(Text, nullable=True)
    medical_history = Column(Text, nullable=True)
    existing_conditions = Column(JSON, nullable=True)
    medications = Column(JSON, nullable=True)
    caregiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="patient_profile", foreign_keys=[user_id])
    caregiver = relationship("User", foreign_keys=[caregiver_id])

    screenings = relationship("ScreeningSession", back_populates="patient")
    assessments = relationship("Assessment", back_populates="patient")
    observations = relationship("PatientObservation", back_populates="patient")
    reminders = relationship("Reminder", back_populates="patient")
    events = relationship("PatientEvent", back_populates="patient")


class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    relation_role = Column(String(60), nullable=True)
    emergency_contact = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="caregiver_profile")

    observations = relationship("PatientObservation", back_populates="caregiver")
    reminders_created = relationship("Reminder", back_populates="creator")


class ScreeningQuestion(Base):
    __tablename__ = "screening_questions"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(40), nullable=False)
    question_text = Column(Text, nullable=False)
    type = Column(String(30), nullable=False)
    max_score = Column(Float, nullable=False, default=1.0)
    instruction = Column(Text, nullable=True)

    responses = relationship("ScreeningResponse", back_populates="question")


class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False, index=True)
    status = Column(SAEnum(ScreeningStatus), nullable=False, default=ScreeningStatus.in_progress)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    total_time_seconds = Column(Integer, nullable=True)

    patient = relationship("PatientProfile", back_populates="screenings")
    responses = relationship("ScreeningResponse", back_populates="session")
    assessment = relationship("Assessment", back_populates="session", uselist=False)


class ScreeningResponse(Base):
    __tablename__ = "screening_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("screening_sessions.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("screening_questions.id"), nullable=False)
    domain = Column(String(40), nullable=False)
    response_text = Column(Text, nullable=True)
    response_value = Column(Float, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)

    session = relationship("ScreeningSession", back_populates="responses")
    question = relationship("ScreeningQuestion", back_populates="responses")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("screening_sessions.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False, index=True)
    cognitive_score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    risk_category = Column(SAEnum(RiskCategory), nullable=False)
    domain_scores = Column(JSON, nullable=True)
    key_observations = Column(JSON, nullable=True)
    areas_requiring_attention = Column(JSON, nullable=True)
    suggested_next_steps = Column(JSON, nullable=True)
    disclaimer = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ScreeningSession", back_populates="assessment")
    patient = relationship("PatientProfile", back_populates="assessments")


class PatientObservation(Base):
    __tablename__ = "patient_observations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False, index=True)
    caregiver_id = Column(Integer, ForeignKey("caregiver_profiles.id"), nullable=True)
    observation_text = Column(Text, nullable=False)
    category = Column(SAEnum(ObservationCategory), nullable=False)
    severity = Column(String(20), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="observations")
    caregiver = relationship("CaregiverProfile", back_populates="observations")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("caregiver_profiles.id"), nullable=True)
    reminder_type = Column(SAEnum(ReminderType), nullable=False)
    title = Column(String(180), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="reminders")
    creator = relationship("CaregiverProfile", back_populates="reminders_created")


class PatientEvent(Base):
    __tablename__ = "patient_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False, index=True)
    event_type = Column(SAEnum(EventType), nullable=False)
    description = Column(Text, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="events")
