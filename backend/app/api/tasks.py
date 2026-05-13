from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import timedelta
from app.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def check_time_conflict(
    db: Session,
    user_id: int,
    start_time,
    end_time,
    exclude_task_id: int = None
):
    """
    Check if a time slot conflicts with existing tasks.
    Two tasks conflict if they overlap: start_A < end_B AND end_A > start_B
    """
    query = db.query(Task).filter(
        Task.user_id == user_id,
        Task.all_day == False,
        Task.start_time < end_time,
        Task.end_time > start_time,
    )

    if exclude_task_id:
        query = query.filter(Task.id != exclude_task_id)

    conflict = query.first()
    return conflict


@router.get("/", response_model=List[TaskResponse])
def get_all_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for current user"""
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new task — checks for time conflicts first"""

    # Skip conflict check for all-day tasks
    if not task.all_day:
        conflict = check_time_conflict(
            db, current_user.id, task.start_time, task.end_time
        )
        if conflict:
            raise HTTPException(
                status_code=409,
                detail=f"Time conflict with existing task: '{conflict.title}' ({conflict.start_time.strftime('%H:%M')} - {conflict.end_time.strftime('%H:%M')}). Please choose a different time."
            )

    new_task = Task(
        **task.dict(),
        user_id=current_user.id
    )
    db.add(new_task)
    db.flush()

    # Generate recurring occurrences
    if task.is_recurring and task.recurrence_days and task.recurrence_end_date:
        days = [int(d) for d in task.recurrence_days.split(",") if d.strip()]
        duration = task.end_time - task.start_time
        current_date = task.start_time + timedelta(days=1)

        while current_date.date() <= task.recurrence_end_date.date():
            if current_date.weekday() in days:
                occurrence_end = current_date + duration

                # Check conflict for each occurrence
                if not task.all_day:
                    occ_conflict = check_time_conflict(
                        db, current_user.id, current_date, occurrence_end,
                        exclude_task_id=new_task.id
                    )
                    if occ_conflict:
                        # Skip this occurrence silently rather than blocking all
                        current_date += timedelta(days=1)
                        continue

                occurrence = Task(
                    title=task.title,
                    description=task.description,
                    start_time=current_date,
                    end_time=occurrence_end,
                    all_day=task.all_day,
                    category=task.category,
                    priority=task.priority,
                    is_recurring=True,
                    recurrence_days=task.recurrence_days,
                    recurrence_end_date=task.recurrence_end_date,
                    parent_task_id=new_task.id,
                    user_id=current_user.id,
                )
                db.add(occurrence)
            current_date += timedelta(days=1)

    db.commit()
    db.refresh(new_task)
    return new_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a single task — checks for time conflicts"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.dict(exclude_unset=True)

    # Get the effective start/end after update
    new_start = update_data.get('start_time', task.start_time)
    new_end = update_data.get('end_time', task.end_time)
    new_all_day = update_data.get('all_day', task.all_day)

    if not new_all_day:
        conflict = check_time_conflict(
            db, current_user.id, new_start, new_end,
            exclude_task_id=task_id
        )
        if conflict:
            raise HTTPException(
                status_code=409,
                detail=f"Time conflict with existing task: '{conflict.title}' ({conflict.start_time.strftime('%H:%M')} - {conflict.end_time.strftime('%H:%M')}). Please choose a different time."
            )

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}/future", response_model=List[TaskResponse])
def update_future_tasks(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update this occurrence and all future occurrences"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    parent_id = task.parent_task_id if task.parent_task_id else task.id

    update_data = task_update.dict(exclude_unset=True)
    new_start = update_data.get('start_time')
    new_end = update_data.get('end_time')

    if new_start and new_end:
        new_duration = new_end - new_start
    elif new_start and not new_end:
        new_duration = task.end_time - task.start_time
    else:
        new_duration = None

    future_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.start_time >= task.start_time,
        or_(
            Task.id == task_id,
            and_(
                Task.parent_task_id == parent_id,
                Task.start_time >= task.start_time,
            )
        )
    ).all()

    for t in future_tasks:
        for field, value in update_data.items():
            if field not in ('start_time', 'end_time'):
                setattr(t, field, value)

        if new_duration is not None and new_start:
            offset = new_start - task.start_time
            t.start_time = t.start_time + offset
            t.end_time = t.start_time + new_duration

    db.commit()
    return future_tasks


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a single task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def toggle_complete(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle task completion"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    db.commit()
    db.refresh(task)
    return task