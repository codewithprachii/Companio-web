from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import PatientProfile, Reminder
from app.schemas import ReminderCreate, ReminderOut

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.post("/", response_model=ReminderOut, status_code=201)
async def create_reminder(payload: ReminderCreate, db: AsyncSession = Depends(get_db)):
    profile = await db.get(PatientProfile, payload.patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")

    reminder = Reminder(
        patient_id=payload.patient_id,
        created_by_id=payload.created_by_id,
        reminder_type=payload.reminder_type,
        title=payload.title,
        description=payload.description,
        scheduled_at=payload.scheduled_at,
    )
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)
    return reminder


@router.get("/patient/{patient_id}", response_model=list[ReminderOut])
async def patient_reminders(patient_id: int, db: AsyncSession = Depends(get_db)):
    profile = await db.get(PatientProfile, patient_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")
    result = await db.execute(
        select(Reminder)
        .where(Reminder.patient_id == patient_id)
        .order_by(Reminder.scheduled_at.asc())
    )
    return result.scalars().all()


@router.put("/{reminder_id}/complete", response_model=ReminderOut)
async def complete_reminder(reminder_id: int, db: AsyncSession = Depends(get_db)):
    reminder = await db.get(Reminder, reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    reminder.is_completed = True
    await db.commit()
    await db.refresh(reminder)
    return reminder
