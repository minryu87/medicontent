from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def analytics_summary():
    # 실제 데이터 집계 로직 필요 (예시)
    return jsonify({
        'views': 387429,
        'engagement': 45678,
        'inquiries': 156,
        'roi': 285,
        'trend': [10000, 12000, 15000, 18000, 20000, 25000],
        'channels': [
            {'name': '인스타그램', 'rate': 82, 'count': 12547},
            {'name': '네이버블로그', 'rate': 68, 'count': 8932},
            {'name': '페이스북', 'rate': 45, 'count': 5623},
            {'name': '유튜브', 'rate': 38, 'count': 3891}
        ],
        'top_contents': [
            {'title': '임플란트 vs 틀니 비교', 'views': 2547},
            {'title': '여름철 피부관리 꿀팁', 'views': 1892},
            {'title': '치아미백 전후 비교', 'views': 1634}
        ]
    })
