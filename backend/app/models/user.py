from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(32), nullable=False)  # admin, manager, staff, viewer
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.hospital_id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    hospital_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(32))  # clinic, hospital, medical_center
    address = db.Column(db.String(256))
    phone = db.Column(db.String(32))
    website = db.Column(db.String(128))
    license_number = db.Column(db.String(64))
    specialties = db.Column(JSONB)
    subscription_plan = db.Column(db.String(32))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Permission(db.Model):
    __tablename__ = 'permissions'
    permission_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    resource_type = db.Column(db.String(64))
    actions = db.Column(JSONB)
    conditions = db.Column(JSONB)
