from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel

from app.models import (
    UserRole,
    RiskCategory,
    ScreeningStatus,
    ReminderType,
    ObservationCategory,
    EventType,
)


class UserCreate(BaseModel):
    name: str
    role: UserRole
    email: Optional[str] = None
    phone: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    role: UserRole
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PatientRegister(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    age: int
    gender: Optional[str] = None
    region: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None
    existing_conditions: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    caregiver_name: Optional[str] = None
    caregiver_phone: Optional[str] = None
    caregiver_relationship: Optional[str] = None


class PatientProfileOut(BaseModel):
    id: int
    user_id: int
    age: int
    gender: Optional[str]
    region: Optional[str]
    address: Optional[str]
    medical_history: Optional[str]
    existing_conditions: Optional[List[Any]]
    medications: Optional[List[Any]]
    caregiver_id: Optional[int]
    created_at: datetime
    user: Optional[UserOut]
    caregiver: Optional[UserOut]
    latest_assessment: Optional["AssessmentOut"] = None

    class Config:
        from_attributes = True


class ScreeningQuestionOut(BaseModel):
    id: int
    domain: str
    question_text: str
    type: str
    max_score: float
    instruction: Optional[str]

    class Config:
        from_attributes = True


class StartScreeningRequest(BaseModel):
    patient_id: int


class ScreeningSessionOut(BaseModel):
    id: int
    patient_id: int
    status: ScreeningStatus
    started_at: datetime
    completed_at: Optional[datetime]
    total_time_seconds: Optional[int]
    responses: List["ScreeningResponseOut"] = []

    class Config:
        from_attributes = True


class RespondRequest(BaseModel):
    question_id: int
    response_text: Optional[str] = None
    response_value: Optional[float] = None
    is_correct: Optional[bool] = None
    time_taken_seconds: Optional[int] = None


class ScreeningResponseOut(BaseModel):
    id: int
    session_id: int
    question_id: int
    domain: str
    response_text: Optional[str]
    response_value: Optional[float]
    is_correct: Optional[bool]
    time_taken_seconds: Optional[int]

    class Config:
        from_attributes = True


class CompleteScreeningRequest(BaseModel):
    pass


class AssessmentOut(BaseModel):
    id: int
    session_id: int
    patient_id: int
    cognitive_score: float
    max_score: float
    risk_category: RiskCategory
    domain_scores: Optional[Any]
    key_observations: Optional[Any]
    areas_requiring_attention: Optional[Any]
    suggested_next_steps: Optional[Any]
    disclaimer: Optional[str]
    generated_at: datetime

    class Config:
        from_attributes = True


class AssessmentHistoryOut(BaseModel):
    patient_id: int
    assessments: List[AssessmentOut] = []


class ObservationCreate(BaseModel):
    patient_id: int
    caregiver_id: Optional[int] = None
    observation_text: str
    category: ObservationCategory
    severity: Optional[str] = None


class ObservationOut(BaseModel):
    id: int
    patient_id: int
    caregiver_id: Optional[int]
    observation_text: str
    category: ObservationCategory
    severity: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


class ReminderCreate(BaseModel):
    patient_id: int
    created_by_id: Optional[int] = None
    reminder_type: ReminderType
    title: str
    description: Optional[str] = None
    scheduled_at: datetime


class ReminderOut(BaseModel):
    id: int
    patient_id: int
    created_by_id: Optional[int]
    reminder_type: ReminderType
    title: str
    description: Optional[str]
    scheduled_at: datetime
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    patient_id: int
    patient_name: str
    risk_category: Optional[RiskCategory]
    message: str
    severity: str
    created_at: datetime


class DashboardStats(BaseModel):
    total_patients: int
    recent_assessments: int
    high_risk_cases: int
    moderate_risk_cases: int
    low_risk_cases: int
    pending_follow_ups: int
    total_reminders: int
    upcoming_reminders: int


class TrendPoint(BaseModel):
    assessment_id: int
    cognitive_score: float
    risk_category: RiskCategory
    generated_at: datetime


class PatientTrends(BaseModel):
    patient_id: int
    patient_name: str
    trend: List[TrendPoint] = []


ScreeningSessionOut.model_rebuild()
PatientProfileOut.model_rebuild()
