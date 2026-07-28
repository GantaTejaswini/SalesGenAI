"""
Tasks CRUD router.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.task import Task
from models.activity import Activity
from models.task_comment import TaskComment
from models.task_attachment import TaskAttachment

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    task_type: Optional[str] = "To-Do"
    priority: Optional[str] = "Medium"
    due_date: Optional[datetime] = None
    lead_id: Optional[str] = None
    labels: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    reminder_times: Optional[List[int]] = None
    category: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None
    assigned_user_id: Optional[str] = None
    is_recurring: Optional[bool] = False
    recurrence_pattern: Optional[str] = None

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    labels: Optional[List[str]] = None
    dependencies: Optional[List[str]] = None
    reminder_times: Optional[List[int]] = None
    category: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None
    is_archived: Optional[bool] = None
    assigned_user_id: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None

class TaskCommentRequest(BaseModel):
    content: str

class BulkActionRequest(BaseModel):
    task_ids: List[str]
    action: str # "complete", "delete", "reopen"

@router.get("")
def list_tasks(
    is_completed: Optional[bool] = Query(default=None),
    is_archived: Optional[bool] = Query(default=False),
    priority: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    assigned_user_id: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    sort_by: Optional[str] = Query(default="due_date_asc"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Task).filter(
        Task.organization_id == current_user.organization_id
    )
    
    # Non-admins only see tasks they own or are assigned to
    if current_user.role not in ["admin", "manager"]:
        query = query.filter((Task.user_id == current_user.id) | (Task.assigned_user_id == current_user.id))

    if is_completed is not None:
        query = query.filter(Task.is_completed == is_completed)
    if is_archived is not None:
        query = query.filter(Task.is_archived == is_archived)
    if priority:
        query = query.filter(Task.priority == priority)
    if category:
        query = query.filter(Task.category == category)
    if assigned_user_id:
        query = query.filter(Task.assigned_user_id == assigned_user_id)
    if start_date:
        query = query.filter(Task.due_date >= start_date)
    if end_date:
        query = query.filter(Task.due_date <= end_date)
    if q:
        search = f"%{q}%"
        query = query.filter((Task.title.ilike(search)) | (Task.description.ilike(search)))

    total = query.count()
    
    if sort_by == "due_date_asc":
        query = query.order_by(Task.due_date.asc().nullslast())
    elif sort_by == "due_date_desc":
        query = query.order_by(Task.due_date.desc().nullsfirst())
    elif sort_by == "created_desc":
        query = query.order_by(Task.created_at.desc())
    else:
        query = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
        
    tasks = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "data": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "task_type": t.task_type,
                "priority": t.priority,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "is_completed": t.is_completed,
                "is_archived": t.is_archived,
                "category": t.category,
                "color": t.color,
                "assigned_user_id": t.assigned_user_id,
                "lead_id": t.lead_id,
                "labels": t.labels,
                "created_at": t.created_at.isoformat(),
            }
            for t in tasks
        ],
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(
    req: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = Task(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        task_type=req.task_type,
        priority=req.priority,
        due_date=req.due_date,
        lead_id=req.lead_id,
        labels=req.labels,
        dependencies=req.dependencies,
        reminder_times=req.reminder_times,
        category=req.category,
        color=req.color,
        notes=req.notes,
        assigned_user_id=req.assigned_user_id,
        is_recurring=req.is_recurring,
        recurrence_pattern=req.recurrence_pattern
    )
    db.add(task)
    db.flush()

    activity = Activity(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        activity_type="task_created",
        description=f"{current_user.full_name} created task: {req.title}",
        related_entity_type="Task",
        related_entity_id=task.id,
    )
    db.add(activity)
    db.commit()
    return {"message": "Task created", "task_id": task.id}

@router.put("/{task_id}")
def update_task(
    task_id: str,
    req: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if req.title is not None: task.title = req.title
    if req.description is not None: task.description = req.description
    if req.task_type is not None: task.task_type = req.task_type
    if req.priority is not None: task.priority = req.priority
    if req.due_date is not None: task.due_date = req.due_date
    if req.is_completed is not None:
        task.is_completed = req.is_completed
        if req.is_completed:
            task.completed_at = datetime.now()
        else:
            task.completed_at = None
    if req.labels is not None: task.labels = req.labels
    if req.dependencies is not None: task.dependencies = req.dependencies
    if req.reminder_times is not None: task.reminder_times = req.reminder_times
    if req.category is not None: task.category = req.category
    if req.color is not None: task.color = req.color
    if req.notes is not None: task.notes = req.notes
    if req.is_archived is not None: task.is_archived = req.is_archived
    if req.assigned_user_id is not None: task.assigned_user_id = req.assigned_user_id
    if req.is_recurring is not None: task.is_recurring = req.is_recurring
    if req.recurrence_pattern is not None: task.recurrence_pattern = req.recurrence_pattern

    db.commit()
    return {"message": "Task updated"}

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()

@router.post("/{task_id}/comments", status_code=status.HTTP_201_CREATED)
def add_comment(
    task_id: str,
    req: TaskCommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = TaskComment(
        task_id=task_id,
        user_id=current_user.id,
        content=req.content
    )
    db.add(comment)
    db.commit()
    return {"message": "Comment added"}

@router.post("/bulk-actions")
def bulk_actions(
    req: BulkActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tasks = db.query(Task).filter(
        Task.id.in_(req.task_ids),
        Task.user_id == current_user.id
    ).all()
    
    for task in tasks:
        if req.action == "complete":
            task.is_completed = True
            task.completed_at = datetime.now()
        elif req.action == "reopen":
            task.is_completed = False
            task.completed_at = None
        elif req.action == "delete":
            db.delete(task)
            
    db.commit()
    return {"message": f"Bulk {req.action} applied to {len(tasks)} tasks"}
