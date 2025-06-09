from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.campaign import Campaign, Schedule
from datetime import datetime

campaign_bp = Blueprint('campaign', __name__)

@campaign_bp.route('/', methods=['POST'])
@jwt_required()
def create_campaign():
    data = request.json
    user_id = get_jwt_identity()
    campaign = Campaign(
        name=data.get('name'),
        description=data.get('description'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        budget=data.get('budget'),
        target_audience=data.get('target_audience'),
        goals=data.get('goals'),
        status='active',
        created_by=user_id
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify({'msg': '캠페인 생성 완료', 'campaign_id': campaign.campaign_id}), 201

@campaign_bp.route('/', methods=['GET'])
@jwt_required()
def list_campaigns():
    user_id = get_jwt_identity()
    campaigns = Campaign.query.filter_by(created_by=user_id).all()
    return jsonify([
        {
            'campaign_id': c.campaign_id,
            'name': c.name,
            'status': c.status,
            'start_date': c.start_date,
            'end_date': c.end_date,
            'budget': c.budget
        } for c in campaigns
    ])

@campaign_bp.route('/<int:campaign_id>', methods=['GET'])
@jwt_required()
def get_campaign(campaign_id):
    campaign = Campaign.query.get(campaign_id)
    if not campaign:
        return jsonify({'msg': '캠페인을 찾을 수 없습니다.'}), 404
    return jsonify({
        'campaign_id': campaign.campaign_id,
        'name': campaign.name,
        'description': campaign.description,
        'status': campaign.status,
        'start_date': campaign.start_date,
        'end_date': campaign.end_date,
        'budget': campaign.budget,
        'target_audience': campaign.target_audience,
        'goals': campaign.goals
    })

@campaign_bp.route('/<int:campaign_id>/schedule', methods=['POST'])
@jwt_required()
def schedule_content(campaign_id):
    data = request.json
    content_id = data.get('content_id')
    channel_id = data.get('channel_id')
    scheduled_time = data.get('scheduled_time')
    schedule = Schedule(
        content_id=content_id,
        campaign_id=campaign_id,
        channel_id=channel_id,
        scheduled_time=scheduled_time,
        status='scheduled',
        retry_count=0
    )
    db.session.add(schedule)
    db.session.commit()
    return jsonify({'msg': '스케줄 등록 완료', 'schedule_id': schedule.schedule_id}), 201
