from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class Content(db.Model):
    __tablename__ = 'contents'
    content_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    body = db.Column(db.Text, nullable=False)
    content_type = db.Column(db.String(32))  # blog, social, email
    status = db.Column(db.String(32))  # draft, review, approved, published, archived
    medical_specialty = db.Column(db.String(64))
    target_audience = db.Column(db.String(128))
    seo_metadata = db.Column(JSONB)
    compliance_score = db.Column(db.Float)
    created_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    approved_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    media_id = db.Column(db.Integer, db.ForeignKey('media.media_id'), nullable=True)
    associated_media = db.Column(JSONB, nullable=True)

class Media(db.Model):
    __tablename__ = 'media'
    media_id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256))
    file_path = db.Column(db.String(512))
    file_type = db.Column(db.String(32))  # image, video, audio, document
    file_size = db.Column(db.Integer)
    alt_text = db.Column(db.String(256))
    media_metadata = db.Column(JSONB)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    contents = db.relationship('Content', backref='main_media', lazy=True, foreign_keys=[Content.media_id])

class Template(db.Model):
    __tablename__ = 'templates'
    template_id = db.Column(db.Integer, primary_key=True)
    template_name = db.Column(db.String(128))
    description = db.Column(db.Text)
    category = db.Column(db.String(64))
    medical_specialty = db.Column(db.String(64))
    template_body = db.Column(db.Text)
    variables = db.Column(JSONB)
    usage_count = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float)
    created_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
