from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/medicontent')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB 업로드 제한
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    jwt.init_app(app)

    # 블루프린트 등록
    from app.routes.user import user_bp
    from app.routes.content import content_bp
    from app.routes.ai import ai_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.approval import approval_bp
    from app.routes.campaign import campaign_bp
    from app.routes.distribution import distribution_bp
    from app.routes.analytics import analytics_bp
    from app.routes.media import media_bp

    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(content_bp, url_prefix='/api/content')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(approval_bp, url_prefix='/api/approval')
    app.register_blueprint(campaign_bp, url_prefix='/api/campaign')
    app.register_blueprint(distribution_bp, url_prefix='/api/distribution')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(media_bp, url_prefix='/api/media')

    return app
