from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.content import Content
from app.models.campaign import Campaign
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def dashboard_summary():
    user_id = get_jwt_identity()
    # 오늘의 성과 예시 (실제 데이터 집계 로직 필요)
    today_views = 12847
    today_engagement = 2349
    today_inquiries = 23
    # 진행 중인 프로젝트 예시
    campaigns = Campaign.query.filter_by(created_by=user_id).all()
    campaign_list = [
        {
            'name': c.name,
            'progress': 80,  # TODO: 실제 진행률 계산
            'status': c.status
        } for c in campaigns
    ]
    # 승인 대기 컨텐츠 예시
    pending_contents = Content.query.filter_by(status='review', created_by=user_id).all()
    pending_list = [
        {
            'content_id': c.content_id,
            'title': c.title
        } for c in pending_contents
    ]
    return jsonify({
        'today': {
            'views': today_views,
            'engagement': today_engagement,
            'inquiries': today_inquiries
        },
        'campaigns': campaign_list,
        'pending': pending_list
    })
