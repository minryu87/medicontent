from flask import Blueprint, request, jsonify
from app import db
from app.models.content import Content, Template, Media
from flask_jwt_extended import jwt_required, get_jwt_identity

content_bp = Blueprint('content', __name__)

@content_bp.route('/', methods=['POST'])
@jwt_required()
def create_content():
    data = request.json
    user_id = get_jwt_identity()
    content = Content(
        title=data.get('title'),
        body=data.get('body'),
        content_type=data.get('content_type'),
        status='draft',
        medical_specialty=data.get('medical_specialty'),
        target_audience=data.get('target_audience'),
        created_by=user_id,
        associated_media=data.get('associated_media')
    )
    db.session.add(content)
    db.session.commit()
    return jsonify({'msg': '컨텐츠 생성 완료', 'content_id': content.content_id}), 201

@content_bp.route('/', methods=['GET'])
@jwt_required()
def list_content():
    user_id = get_jwt_identity()
    contents = Content.query.filter_by(created_by=user_id).order_by(Content.created_at.desc()).all()
    return jsonify([
        {
            'content_id': c.content_id,
            'title': c.title,
            'status': c.status,
            'created_at': c.created_at.isoformat(),
            'medical_specialty': c.medical_specialty,
            'seo_score': c.seo_score,
            'compliance_score': c.compliance_score,
        } for c in contents
    ])

@content_bp.route('/templates', methods=['GET'])
@jwt_required()
def list_templates():
    query = Template.query
    category = request.args.get('category')
    medical_specialty = request.args.get('medical_specialty')

    if category:
        query = query.filter_by(category=category)
    if medical_specialty:
        query = query.filter_by(medical_specialty=medical_specialty)

    templates = query.order_by(Template.usage_count.desc().nullslast(), Template.rating.desc().nullslast()).all()
    
    return jsonify([
        {
            'template_id': t.template_id,
            'template_name': t.template_name,
            'description': t.description,
            'category': t.category,
            'medical_specialty': t.medical_specialty,
            'rating': t.rating,
            'usage_count': t.usage_count
        } for t in templates
    ])

@content_bp.route('/templates/<int:template_id>', methods=['GET'])
@jwt_required()
def get_template_detail(template_id):
    template = Template.query.get_or_404(template_id)
    return jsonify({
        'template_id': template.template_id,
        'template_name': template.template_name,
        'description': template.description,
        'category': template.category,
        'medical_specialty': template.medical_specialty,
        'template_body': template.template_body,
        'variables': template.variables,
        'rating': template.rating,
    })

@content_bp.route('/<int:content_id>', methods=['GET'])
@jwt_required()
def get_content(content_id):
    content = Content.query.get_or_404(content_id)
    # associated_media에 포함된 media 객체들을 serialize
    media_list = []
    if content.associated_media:
        for media_item in content.associated_media:
            media_obj = Media.query.get(media_item.get('media_id'))
            if media_obj:
                media_list.append({
                    'media_id': media_obj.media_id,
                    'url': media_obj.file_path,
                    'alt_text': media_obj.alt_text,
                    'description': media_item.get('description') 
                })

    return jsonify({
        'content_id': content.content_id,
        'title': content.title,
        'body': content.body,
        'content_type': content.content_type,
        'status': content.status,
        'medical_specialty': content.medical_specialty,
        'target_audience': content.target_audience,
        'seo_score': content.seo_score,
        'compliance_score': content.compliance_score,
        'created_by': content.created_by,
        'created_at': content.created_at.isoformat(),
        'updated_at': content.updated_at.isoformat(),
        'associated_media': media_list
    })

@content_bp.route('/<int:content_id>', methods=['PUT'])
@jwt_required()
def update_content(content_id):
    content = Content.query.get_or_404(content_id)
    user_id = get_jwt_identity()
    if content.created_by != user_id:
        return jsonify({'msg': '수정 권한이 없습니다.'}), 403

    data = request.json
    content.title = data.get('title', content.title)
    content.body = data.get('body', content.body)
    content.medical_specialty = data.get('medical_specialty', content.medical_specialty)
    content.target_audience = data.get('target_audience', content.target_audience)
    content.associated_media = data.get('associated_media', content.associated_media)
    db.session.commit()
    return jsonify({'msg': '컨텐츠가 성공적으로 수정되었습니다.'})

@content_bp.route('/<int:content_id>', methods=['DELETE'])
@jwt_required()
def delete_content(content_id):
    content = Content.query.get_or_404(content_id)
    user_id = get_jwt_identity()
    if content.created_by != user_id:
        return jsonify({'msg': '삭제 권한이 없습니다.'}), 403

    db.session.delete(content)
    db.session.commit()
    return jsonify({'msg': '컨텐츠가 성공적으로 삭제되었습니다.'})
