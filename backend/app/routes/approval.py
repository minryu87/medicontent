from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.campaign import ApprovalWorkflow
from app.models.content import Content
from app.models.user import User
from datetime import datetime
from app.utils.role_required import role_required

approval_bp = Blueprint('approval', __name__)

@approval_bp.route('/request', methods=['POST'])
@jwt_required()
@role_required(['manager', 'staff'])
def request_approval():
    data = request.json
    content_id = data.get('content_id')
    approver_id = data.get('approver_id')
    user_id = get_jwt_identity()
    if not content_id or not approver_id:
        return jsonify({'msg': '필수 정보 누락'}), 400
    workflow = ApprovalWorkflow(
        content_id=content_id,
        requester_id=user_id,
        approver_id=approver_id,
        step_order=1,
        status='pending',
        created_at=datetime.utcnow()
    )
    content = Content.query.get(content_id)
    if content:
        content.status = 'review'
    db.session.add(workflow)
    db.session.commit()
    return jsonify({'msg': '승인 요청 완료'}), 201

@approval_bp.route('/pending', methods=['GET'])
@jwt_required()
@role_required(['admin', 'manager', 'medical', 'staff'])
def pending_approvals():
    user_id = get_jwt_identity()
    workflows = ApprovalWorkflow.query.filter_by(approver_id=user_id, status='pending').all()
    result = []
    for w in workflows:
        content = Content.query.get(w.content_id)
        result.append({
            'workflow_id': w.workflow_id,
            'content_id': w.content_id,
            'title': content.title if content else '',
            'status': w.status,
            'step_order': w.step_order,
            'created_at': w.created_at
        })
    return jsonify(result)

@approval_bp.route('/action', methods=['POST'])
@jwt_required()
@role_required(['admin', 'medical'])
def approval_action():
    data = request.json
    workflow_id = data.get('workflow_id')
    action = data.get('action')  # 'approve' or 'reject'
    comments = data.get('comments', '')
    user_id = get_jwt_identity()
    workflow = ApprovalWorkflow.query.get(workflow_id)
    if not workflow or workflow.approver_id != user_id:
        return jsonify({'msg': '권한 없음'}), 403
    if action == 'approve':
        workflow.status = 'approved'
        workflow.approved_at = datetime.utcnow()
        content = Content.query.get(workflow.content_id)
        if content:
            content.status = 'approved'
            content.approved_by = user_id
    elif action == 'reject':
        workflow.status = 'rejected'
        workflow.comments = comments
        content = Content.query.get(workflow.content_id)
        if content:
            content.status = 'draft'
    else:
        return jsonify({'msg': '잘못된 액션'}), 400
    db.session.commit()
    return jsonify({'msg': '처리 완료'})
