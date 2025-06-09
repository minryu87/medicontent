from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import os
from app import db
from app.models.content import Content
from app.services.content_generator import ContentGenerator

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate-intelligent-content', methods=['POST'])
@jwt_required()
def generate_intelligent_content_api():
    """
    템플릿, 사용자 입력, 병원 정보를 종합하여 지능적으로 컨텐츠를 생성하고 DB에 저장합니다.
    """
    user_id = get_jwt_identity()
    data = request.json
    
    template_id = data.get('template_id')
    user_inputs = data.get('user_inputs')
    media_info = data.get('media_info') # [{'media_id': 1, 'description': '설명'}, ...]

    if not template_id or not user_inputs:
        return jsonify({'msg': '템플릿 ID와 사용자 입력은 필수입니다.'}), 400

    # 1. ContentGenerator 서비스를 사용하여 컨텐츠 생성
    generator = ContentGenerator(
        template_id=template_id,
        user_inputs=user_inputs,
        user_id=user_id,
        media_info=media_info
    )
    result = generator.create_intelligent_content()

    if result and result.get("error"):
        return jsonify({'msg': '컨텐츠 생성 실패', 'detail': result['error']}), 500

    # 2. 생성된 컨텐츠를 DB에 저장
    # media_ids 리스트에서 첫 번째 ID를 대표 media_id로 사용 (선택적)
    representative_media_id = result['media_ids'][0] if result.get('media_ids') else None
    
    new_content = Content(
        title=result['title'],
        body=result['body'],
        content_type=result['content_type'],
        status=result['status'],
        medical_specialty=result['medical_specialty'],
        seo_metadata=result['seo_metadata'],
        compliance_score=result['compliance_score'],
        created_by=result['created_by'],
        media_id=representative_media_id,
        associated_media={'media': [{'id': mid} for mid in result.get('media_ids', [])]}
    )
    db.session.add(new_content)
    db.session.commit()

    return jsonify({
        'msg': '컨텐츠가 성공적으로 생성되었습니다.',
        'content_id': new_content.content_id,
        'title': new_content.title,
        'body': new_content.body,
        'seo_score': new_content.seo_metadata.get('score') if new_content.seo_metadata else None,
        'compliance_score': new_content.compliance_score
    }), 201

# Google Gemini API 연동 (텍스트 생성, 파라미터 확장)
@ai_bp.route('/generate-text', methods=['POST'])
@jwt_required()
def generate_text():
    data = request.json
    content_type = data.get('content_type', 'blog_post')
    medical_specialty = data.get('medical_specialty', '')
    target_audience = data.get('target_audience', '')
    tone = data.get('tone', 'professional')
    keywords = data.get('keywords', [])
    content_length = data.get('content_length', 'medium')
    prompt = data.get('prompt', '')

    # 프롬프트 생성
    if not prompt:
        prompt = f"""
        [{content_type}] 컨텐츠를 생성해 주세요.
        진료과목: {medical_specialty}
        타겟: {target_audience}
        톤: {tone}
        키워드: {', '.join(keywords)}
        길이: {content_length}
        """

    api_key = os.getenv('GEMINI_API_KEY')
    url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + api_key
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        result = response.json()
        generated_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        return jsonify({'generated_text': generated_text})
    else:
        return jsonify({'msg': 'AI 생성 실패', 'detail': response.text}), 500

# Google Gemini API 연동 (이미지 생성)
@ai_bp.route('/generate-image', methods=['POST'])
@jwt_required()
def generate_image():
    data = request.json
    image_type = data.get('image_type', 'infographic')
    medical_context = data.get('medical_context', '')
    brand_colors = data.get('brand_colors', [])
    dimensions = data.get('dimensions', {'width': 1024, 'height': 1024})
    style = data.get('style', 'illustration')

    # 프롬프트 생성
    prompt = f"""
    [{image_type}] 이미지를 생성해 주세요.
    의료 맥락: {medical_context}
    브랜드 컬러: {', '.join(brand_colors)}
    크기: {dimensions['width']}x{dimensions['height']}
    스타일: {style}
    """

    # 실제 Gemini 이미지 생성 API 엔드포인트/파라미터로 교체 필요
    api_key = os.getenv('GEMINI_API_KEY')
    url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=' + api_key
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        result = response.json()
        # 실제 응답 구조에 따라 파싱 필요 (예시)
        image_url = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('inline_data', {}).get('url', '')
        metadata = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('inline_data', {}).get('metadata', {})
        alt_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('inline_data', {}).get('alt_text', '')
        return jsonify({'image_url': image_url, 'metadata': metadata, 'alt_text': alt_text})
    else:
        return jsonify({'msg': 'AI 이미지 생성 실패', 'detail': response.text}), 500
