import json
from app import create_app, db
from app.models import Hospital, Template

def seed_data():
    """Seeds the database with initial data."""
    app = create_app()
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        print("Tables created.")

        # --- Seed Hospital ---
        if not Hospital.query.first():
            print("Seeding Hospital...")
            hospital = Hospital(
                name="서울더마피부과",
                address="서울시 강남구 테헤란로 123",
                phone="02-1234-5678",
                specialties=["피부과", "미용"],
                website="https://seoulderma.com"
            )
            db.session.add(hospital)
            print("Hospital seeded.")

        # --- Seed Templates ---
        if not Template.query.first():
            print("Seeding Templates...")
            templates_data = [
                # --- 블로그 ---
                {
                    "template_name": "여드름 원인과 치료법 상세 분석",
                    "category": "blog",
                    "medical_specialty": "dermatology",
                    "description": "환자들이 가장 궁금해하는 여드름의 근본적인 원인과 최신 치료 방법에 대해 상세히 설명하는 블로그 포스트입니다.",
                    "template_body": """
# {post_title}

## 서론: 지긋지긋한 여드름, 원인부터 알아야 끝낼 수 있습니다.
안녕하세요. {hospital_name}입니다. 오늘은 많은 분들의 피부 고민, 바로 여드름에 대해 이야기해보려고 합니다. 
단순히 피부 트러블로 여기기 쉽지만, 여드름은 {acne_cause} 등 복합적인 원인에 의해 발생하는 피부 '질환'입니다.

## 본론 1: 여드름, 도대체 왜 생기는 걸까요?
1. **과도한 피지 분비**: {sebum_story}
2. **모공 막힘**: {keratin_story}
3. **여드름균 증식**: {acne_bacteria_story}

## 본론 2: {hospital_name}의 전문적인 여드름 치료 프로그램
저희 {hospital_name}에서는 개인의 피부 타입과 여드름의 원인을 정밀하게 분석하여, 다음과 같은 맞춤형 치료를 제공합니다.
- **{treatment_1_name}**: {treatment_1_description}
- **{treatment_2_name}**: {treatment_2_description}
- **{treatment_3_name}**: {treatment_3_description}

## 결론: 여드름 치료, 이제 전문의와 함께하세요.
{closing_remark}
더 이상 혼자 고민하지 마시고, {hospital_name}에 내원하여 정확한 진단과 치료를 받아보세요.

*본 포스팅은 의료 정보를 제공하기 위해 작성되었으며, 전문적인 의학적 진단이나 치료를 대체할 수 없습니다.*
                    """,
                    "variables": json.dumps([
                        {"id": "post_title", "question": "포스트의 전체 제목을 입력해주세요.", "type": "text"},
                        {"id": "acne_cause", "question": "여드름의 주요 원인에 대해 간단히 언급해주세요. (예: 호르몬 불균형, 스트레스)", "type": "text"},
                        {"id": "sebum_story", "question": "피지 분비와 여드름의 관계에 대해 알기 쉽게 설명해주세요.", "type": "textarea"},
                        {"id": "keratin_story", "question": "각질과 모공 막힘이 여드름을 어떻게 유발하는지 설명해주세요.", "type": "textarea"},
                        {"id": "acne_bacteria_story", "question": "여드름균(P. acnes)의 역할과 염증 발생 과정에 대해 설명해주세요.", "type": "textarea"},
                        {"id": "treatment_1_name", "question": "첫 번째 치료법의 이름을 입력해주세요. (예: 스케일링)", "type": "text"},
                        {"id": "treatment_1_description", "question": "첫 번째 치료법에 대해 상세히 설명해주세요.", "type": "textarea"},
                        {"id": "treatment_2_name", "question": "두 번째 치료법의 이름을 입력해주세요. (예: 압출 관리)", "type": "text"},
                        {"id": "treatment_2_description", "question": "두 번째 치료법에 대해 상세히 설명해주세요.", "type": "textarea"},
                        {"id": "treatment_3_name", "question": "세 번째 치료법의 이름을 입력해주세요. (예: 레이저 치료)", "type": "text"},
                        {"id": "treatment_3_description", "question": "세 번째 치료법에 대해 상세히 설명해주세요.", "type": "textarea"},
                        {"id": "closing_remark", "question": "마무리 인사말과 병원 방문 권유 메시지를 작성해주세요.", "type": "textarea"}
                    ])
                },
                {
                    "template_name": "인스타그램: 시술 전후 사진 활용",
                    "category": "instagram",
                    "medical_specialty": "plastic_surgery",
                    "description": "시술 전후 사진을 활용하여 시술 효과를 직관적으로 보여주는 인스타그램 피드 컨텐츠입니다.",
                    "template_body": """
{intro_text}

✨ **{procedure_name}** 전후 비교 ✨
{before_after_photo_description}

저희 {hospital_name}에서는 풍부한 경험을 바탕으로 만족도 높은 결과를 만들어냅니다.
{event_promotion_text}

지금 바로 상담받아보세요!
📞 {hospital_phone}
📍 {hospital_address}

# {hashtag_procedure} #{hashtag_location} #{hospital_name_hashtag} #성형외과추천
                    """,
                    "variables": json.dumps([
                        {"id": "intro_text", "question": "시술에 대한 흥미를 유발하는 소개 문구를 입력하세요.", "type": "textarea"},
                        {"id": "procedure_name", "question": "어떤 시술에 대한 것인지 입력하세요. (예: 눈매교정, 코 성형)", "type": "text"},
                        {"id": "before_after_photo_description", "question": "첨부할 전후 사진에 대한 설명을 작성하세요. (AI가 사진을 이해하는 데 도움이 됩니다)", "type": "image_description"},
                        {"id": "event_promotion_text", "question": "진행중인 이벤트나 프로모션이 있다면 작성해주세요.", "type": "text"},
                        {"id": "hashtag_procedure", "question": "시술 관련 핵심 해시태그를 입력하세요. (예: #눈매교정)", "type": "text"},
                        {"id": "hashtag_location", "question": "지역 관련 해시태그를 입력하세요. (예: #강남성형외과)", "type": "text"},
                        {"id": "hospital_name_hashtag", "question": "병원 이름 해시태그를 입력하세요. (예: #서울더마성형외과)", "type": "text"}
                    ])
                }
            ]
            
            for t_data in templates_data:
                template = Template(**t_data)
                db.session.add(template)
            
            print(f"{len(templates_data)} templates seeded.")

        db.session.commit()
        print("Data seeding complete.")

if __name__ == '__main__':
    seed_data() 