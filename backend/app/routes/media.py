from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.content import Media
from werkzeug.utils import secure_filename
import os
from datetime import datetime

media_bp = Blueprint('media', __name__)
UPLOAD_FOLDER = os.getenv('MEDIA_UPLOAD_PATH', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@media_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_media():
    if 'file' not in request.files:
        return jsonify({'msg': '파일이 없습니다.'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': '파일명이 없습니다.'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)
        user_id = get_jwt_identity()
        media = Media(
            filename=filename,
            file_path=save_path,
            file_type=file.content_type,
            file_size=os.path.getsize(save_path),
            alt_text=request.form.get('alt_text', ''),
            uploaded_by=user_id,
            created_at=datetime.utcnow()
        )
        db.session.add(media)
        db.session.commit()
        return jsonify({'msg': '업로드 성공', 'media_id': media.media_id, 'url': f'/api/media/file/{media.media_id}'}), 201
    else:
        return jsonify({'msg': '허용되지 않는 파일 형식'}), 400

@media_bp.route('/file/<int:media_id>', methods=['GET'])
def get_media_file(media_id):
    media = Media.query.get(media_id)
    if not media:
        return jsonify({'msg': '파일을 찾을 수 없습니다.'}), 404
    directory = os.path.dirname(media.file_path)
    filename = os.path.basename(media.file_path)
    return send_from_directory(directory, filename)

@media_bp.route('/list', methods=['GET'])
@jwt_required()
def list_media():
    user_id = get_jwt_identity()
    media_list = Media.query.filter_by(uploaded_by=user_id).all()
    return jsonify([
        {
            'media_id': m.media_id,
            'filename': m.filename,
            'url': f'/api/media/file/{m.media_id}',
            'alt_text': m.alt_text,
            'created_at': m.created_at
        } for m in media_list
    ])

@media_bp.route('/delete/<int:media_id>', methods=['DELETE'])
@jwt_required()
def delete_media(media_id):
    user_id = get_jwt_identity()
    media = Media.query.get(media_id)
    if not media or media.uploaded_by != user_id:
        return jsonify({'msg': '권한 없음'}), 403
    try:
        os.remove(media.file_path)
    except Exception:
        pass
    db.session.delete(media)
    db.session.commit()
    return jsonify({'msg': '삭제 완료'})
