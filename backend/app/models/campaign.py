from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    campaign_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    budget = db.Column(db.Integer)
    target_audience = db.Column(JSONB)
    goals = db.Column(JSONB)
    status = db.Column(db.String(32))  # active, paused, completed
    created_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Schedule(db.Model):
    __tablename__ = 'schedules'
    schedule_id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.Integer, db.ForeignKey('contents.content_id'))
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.campaign_id'))
    channel_id = db.Column(db.Integer)
    scheduled_time = db.Column(db.DateTime)
    status = db.Column(db.String(32))  # scheduled, published, failed
    retry_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ApprovalWorkflow(db.Model):
    __tablename__ = 'approval_workflows'
    workflow_id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.Integer, db.ForeignKey('contents.content_id'))
    requester_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    approver_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    step_order = db.Column(db.Integer)
    status = db.Column(db.String(32))  # pending, approved, rejected
    comments = db.Column(db.Text)
    approved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
