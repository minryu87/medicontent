# medicontent/backend/app/services/content_generator.py
import os
import requests
import random
import re
import json
from flask import current_app

from app.models.content import Template
from app.models.user import User, Hospital

class ContentGenerator:
    """지능형 컨텐츠 생성 및 관리 서비스"""

    def __init__(self, template_id, user_inputs, user_id, media_info=None):
        self.template_id = template_id
        self.user_inputs = user_inputs # {'variable_id_1': 'answer_1', ...}
        self.user_id = user_id
        self.media_info = media_info or [] # [{'media_id': 1, 'description': '설명'}]
        self.user = User.query.get(self.user_id)
        self.hospital = Hospital.query.get(self.user.hospital_id) if self.user and self.user.hospital_id else None
        self.template = Template.query.get(self.template_id)

    def _assemble_prompt(self):
        """템플릿과 사용자 입력, 병원 정보를 조합하여 최종 AI 프롬프트를 생성합니다."""
        if not self.template:
            raise ValueError("유효하지 않은 템플릿 ID입니다.")
        
        prompt_body = self.template.template_body
        
        # 1. 사용자 답변으로 변수 채우기
        for key, value in self.user_inputs.items():
            prompt_body = prompt_body.replace(f"{{{key}}}", str(value))

        # 2. 업로드된 이미지 설명으로 변수 채우기
        image_desc_vars = [v['id'] for v in self.template.variables if v['type'] == 'image_description']
        for i, media_item in enumerate(self.media_info):
            if i < len(image_desc_vars):
                var_id_to_replace = image_desc_vars[i]
                description = media_item.get('description', '')
                prompt_body = prompt_body.replace(f"{{{var_id_to_replace}}}", description)

        # 3. 병원 정보로 변수 채우기
        if self.hospital:
            prompt_body = prompt_body.replace("{hospital_name}", self.hospital.name)
            prompt_body = prompt_body.replace("{hospital_contact}", f"{self.hospital.phone}, {self.hospital.website}")
            
            if self.hospital.specialties:
                strengths = self.hospital.specialties.get('strengths', '')
                unique_selling_point = self.hospital.specialties.get('unique_selling_point', '')
                prompt_body = prompt_body.replace("{hospital_specific_strength}", strengths)
                prompt_body = prompt_body.replace("{hospital_unique_selling_point}", unique_selling_point)
            
            hospital_name_hashtag = self.hospital.name.replace(" ", "")
            prompt_body = prompt_body.replace("{hospital_name_hashtag}", hospital_name_hashtag)
        
        prompt_body = re.sub(r'\{[a-zA-Z0-9_]+\}', '', prompt_body)

        return prompt_body

    def _call_ai_api(self, prompt, is_json_output=False):
        """Google Gemini API를 호출합니다."""
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다.")
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
        
        if is_json_output:
            prompt += '\n\n응답은 반드시 다음의 JSON 형식으로만 제공해주세요: {"title": "생성된 제목", "body": "생성된 본문 내용"}'

        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        
        try:
            response = requests.post(url, json=payload, timeout=90)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"AI API 호출 오류: {e}")
            return None

    def _parse_ai_response(self, response_json):
        """AI API 응답에서 텍스트를 파싱합니다."""
        try:
            return response_json['candidates'][0]['content']['parts'][0]['text']
        except (KeyError, IndexError, TypeError):
            current_app.logger.error(f"AI 응답 파싱 실패: {response_json}")
            return None

    def _evaluate_content(self, text_content):
        """생성된 컨텐츠를 평가합니다. (시뮬레이션)"""
        seo_score = random.randint(60, 95)
        compliance_score = random.randint(70, 99)
        return {'seo': seo_score, 'compliance': compliance_score}

    def _refine_prompt(self, original_prompt, evaluation_scores):
        """평가 점수가 낮을 경우, 프롬프트를 수정하여 재생성을 유도합니다."""
        if evaluation_scores['seo'] < 75:
            original_prompt += "\n\nSEO 최적화를 위해 주요 키워드를 더 자연스럽게 본문에 녹여내고, 제목을 더 매력적으로 수정해주세요."
        if evaluation_scores['compliance'] < 80:
            original_prompt += "\n\n의료법 가이드라인을 엄격히 준수하여, 과장되거나 검증되지 않은 표현은 모두 제거하고 객관적인 정보 위주로 수정해주세요."
        return original_prompt

    def create_intelligent_content(self):
        """
        템플릿 기반 컨텐츠 생성의 전체 파이프라인을 실행합니다.
        """
        try:
            final_prompt = self._assemble_prompt()
            
            is_json_response_needed = self.template.category == 'blog_post'
            
            ai_response = self._call_ai_api(final_prompt, is_json_output=is_json_response_needed)
            
            if not ai_response:
                return {"error": "AI API 호출에 실패했습니다."}

            generated_text = self._parse_ai_response(ai_response)
            if not generated_text:
                return {"error": "AI 응답을 파싱하는 데 실패했습니다."}

            evaluation = self._evaluate_content(generated_text)

            if evaluation['seo'] < 75 or evaluation['compliance'] < 80:
                current_app.logger.info(f"콘텐츠 점수가 낮아 재생성을 시도합니다. SEO: {evaluation['seo']}, Compliance: {evaluation['compliance']}")
                refined_prompt = self._refine_prompt(final_prompt, evaluation)
                ai_response = self._call_ai_api(refined_prompt, is_json_output=is_json_response_needed)
                if ai_response:
                    refined_text = self._parse_ai_response(ai_response)
                    if refined_text:
                        generated_text = refined_text
                        evaluation = self._evaluate_content(generated_text)
            
            title = "생성된 컨텐츠"
            body = generated_text
            
            if is_json_response_needed:
                try:
                    clean_json_str = generated_text.strip().replace('```json', '').replace('```', '').strip()
                    content_json = json.loads(clean_json_str)
                    title = content_json.get('title', '제목 생성 실패')
                    body = content_json.get('body', '본문 생성 실패')
                except json.JSONDecodeError:
                    current_app.logger.error("JSON 파싱 실패, 전체 텍스트를 body로 사용합니다.")
                    try:
                        title, body = body.split('\n', 1)
                    except ValueError:
                        title = "생성된 컨텐츠"
            
            return {
                "title": title,
                "body": body,
                "seo_metadata": {"score": evaluation['seo']},
                "compliance_score": evaluation['compliance'],
                "status": "draft",
                "content_type": self.template.category,
                "medical_specialty": self.template.medical_specialty,
                "created_by": self.user_id,
                "media_ids": [m['media_id'] for m in self.media_info if 'media_id' in m] 
            }

        except Exception as e:
            current_app.logger.error(f"지능형 컨텐츠 생성 중 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            return {"error": str(e)} 