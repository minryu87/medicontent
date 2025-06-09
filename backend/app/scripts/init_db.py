from app import create_app, db
from app.models import *
from passlib.hash import bcrypt
from datetime import datetime, timezone

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()
    # 샘플 병원
    hospital = Hospital(
        name='샘플병원',
        type='clinic',
        address='서울시 강남구',
        phone='02-1234-5678',
        website='https://sample-hospital.com',
        license_number='A123456',
        specialties={'strengths': '임플란트, 보철 치료', 'unique_selling_point': '3D CT 장비를 이용한 정밀 진단 및 시술'},
        subscription_plan='basic',
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.session.add(hospital)
    db.session.commit()
    # 샘플 관리자
    admin = User(
        email='admin@sample.com',
        password_hash=bcrypt.hash('admin1234'),
        role='admin',
        hospital_id=hospital.hospital_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.session.add(admin)
    # 샘플 의료진
    medical = User(
        email='doctor@sample.com',
        password_hash=bcrypt.hash('doctor1234'),
        role='medical',
        hospital_id=hospital.hospital_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.session.add(medical)
    # 샘플 컨텐츠
    content = Content(
        title='임플란트 치료 가이드',
        body='임플란트 치료는 ...',
        content_type='blog',
        status='draft',
        medical_specialty='치과',
        target_audience='40-60대',
        created_by=admin.user_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.session.add(content)
    db.session.commit()
    # 샘플 템플릿
    templates = [
        Template(
            template_name='블로그 포스트 (정형외과 - 허리 디스크)',
            description='허리 디스크 환자를 위한 정보성 블로그 포스트 템플릿입니다.',
            category='blog',
            medical_specialty='orthopedics',
            template_body='<h2>{{제목}}</h2><p>{{서론}}</p><h3>허리 디스크의 원인</h3><p>{{원인}}</p><h3>증상 및 진단</h3><p>{{증상}}</p><h3>치료 방법</h3><p>{{치료}}</p><p>{{결론}}</p>',
            variables=[
                {'id': 'title', 'question': '콘텐츠의 주제(제목)는 무엇인가요?', 'type': 'text'},
                {'id': 'intro', 'question': '환자들이 공감할 만한 서론을 간단히 작성해주세요.', 'type': 'textarea'},
                {'id': 'cause', 'question': '허리 디스크의 주요 원인은 무엇인가요?', 'type': 'textarea'},
                {'id': 'symptom', 'question': '대표적인 증상과 진단 방법에 대해 알려주세요.', 'type': 'textarea'},
                {'id': 'treatment', 'question': '최신 치료 방법이나 병원만의 특장점을 서술해주세요.', 'type': 'textarea'},
                {'id': 'conclusion', 'question': '환자들에게 당부하고 싶은 말로 마무리해주세요.', 'type': 'textarea'}
            ],
            usage_count=10,
            rating=4.5
        ),
        Template(
            template_name='SNS 카드뉴스 (정형외과 - 거북목 증후군)',
            description='거북목 증후군 예방 및 스트레칭 방법을 안내하는 카드뉴스 템플릿입니다.',
            category='social_media',
            medical_specialty='orthopedics',
            template_body='[1] 제목: 거북목, 더 이상 방치하지 마세요! [2] 내용: 스마트폰 사용이 늘면서...',
            variables=[
                {'id': 'card1_title', 'question': '카드뉴스 1번 페이지 제목', 'type': 'text'},
                {'id': 'card1_body', 'question': '카드뉴스 1번 페이지 내용', 'type': 'textarea'},
                {'id': 'card2_image', 'question': '카드뉴스 2번 페이지에 들어갈 이미지를 선택하세요.', 'type': 'image_description'}
            ],
            usage_count=25,
            rating=4.8
        ),
        Template(
            template_name='블로그 포스트 (치과 - 임플란트)',
            description='임플란트 시술 과정과 주의사항을 설명하는 블로그 포스트 템플릿입니다.',
            category='blog',
            medical_specialty='dentistry',
            template_body='<h1>{{제목}}</h1><p>{{임플란트란}}</p><h2>시술 과정</h2><p>{{과정}}</p><h2>시술 후 주의사항</h2><p>{{주의사항}}</p>',
            variables=[
                {'id': 'title', 'question': '임플란트 관련 포스트 제목', 'type': 'text'},
                {'id': 'definition', 'question': '임플란트에 대해 간단히 정의해주세요.', 'type': 'textarea'},
                {'id': 'procedure', 'question': '시술 과정을 단계별로 설명해주세요.', 'type': 'textarea'},
                {'id': 'aftercare', 'question': '시술 후 주의사항은 무엇인가요?', 'type': 'textarea'}
            ],
            usage_count=15,
            rating=4.7
        ),
        Template(
            template_name='블로그 포스트 (피부과 - 여드름 치료)',
            description='여드름의 원인과 최신 치료법을 소개하는 블로그 포스트 템플릿.',
            category='blog',
            medical_specialty='dermatology',
            template_body='<h1>{{제목}}</h1><p>{{여드름의_원인}}</p><h2>치료 방법</h2><p>{{치료법_소개}}</p><h3>주의사항</h3><p>{{주의사항}}</p>',
            variables=[
                {'id': 'title', 'question': '여드름 관련 포스트 제목', 'type': 'text'},
                {'id': 'cause', 'question': '여드름의 주요 원인은 무엇인가요?', 'type': 'textarea'},
                {'id': 'treatment', 'question': '병원에서 제공하는 치료법을 소개해주세요.', 'type': 'textarea'},
                {'id': 'caution', 'question': '치료 후 주의사항을 알려주세요.', 'type': 'textarea'}
            ]
        )
    ]
    db.session.bulk_save_objects(templates)
    db.session.commit()
    print('DB 초기화 및 샘플 데이터 생성 완료')
