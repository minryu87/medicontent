from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User, Hospital
from passlib.hash import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'staff')
    hospital_id = data.get('hospital_id')
    if User.query.filter_by(email=email).first():
        return jsonify({'msg': '이미 등록된 이메일입니다.'}), 400
    pw_hash = bcrypt.hash(password)
    user = User(email=email, password_hash=pw_hash, role=role, hospital_id=hospital_id)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': '회원가입 성공'}), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.verify(password, user.password_hash):
        return jsonify({'msg': '이메일 또는 비밀번호가 올바르지 않습니다.'}), 401
    access_token = create_access_token(identity=str(user.user_id))
    return jsonify({'access_token': access_token, 'user_id': user.user_id, 'role': user.role}), 200

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': '사용자 정보를 찾을 수 없습니다.'}), 404
    return jsonify({
        'user_id': user.user_id,
        'email': user.email,
        'role': user.role,
        'hospital_id': user.hospital_id
    })
