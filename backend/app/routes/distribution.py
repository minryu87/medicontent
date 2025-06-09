from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.campaign import Schedule
from app.models.content import Content
from datetime import datetime

distribution_bp = Blueprint('distribution', __name__)

@distribution_bp.route('/publish', methods=['POST'])
@jwt_required()
def publish_content():
    data = request.json
    schedule_id = data.get('schedule_id')
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'msg': '스케줄을 찾을 수 없습니다.'}), 404
    content = Content.query.get(schedule.content_id)
    if not content:
        return jsonify({'msg': '컨텐츠를 찾을 수 없습니다.'}), 404
    # 실제 배포 로직(네이버, 인스타 등 API 연동)은 추후 구현
    schedule.status = 'published'
    content.status = 'published'
    db.session.commit()
    return jsonify({'msg': '배포 완료'})
