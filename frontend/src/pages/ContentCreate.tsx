import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MediaUploader from '../components/MediaUploader';
import MediaLibrary from '../components/MediaLibrary';
import { getTemplates, getTemplateDetails } from '../api/content';
import { generateIntelligentContent } from '../api/ai';
import { Template, TemplateVariable, Media } from '../types';
import './ContentCreate.css';

const ContentCreate: React.FC = () => {
  // --- State Management ---
  // Step 1: Template Selection
  const [category, setCategory] = useState('');
  const [medicalSpecialty, setMedicalSpecialty] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Step 2: Dynamic Form
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userInputs, setUserInputs] = useState<{[key: string]: string}>({});
  const [mediaInfo, setMediaInfo] = useState<{media_id: number; description: string}[]>([]);

  // Step 3: Result Display
  const [generatedContent, setGeneratedContent] = useState<{
    content_id: number;
    title: string;
    body: string;
    seo_score?: number;
    compliance_score?: number;
  } | null>(null);

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Effects ---
  useEffect(() => {
    const fetchTemplates = async () => {
      if (category && medicalSpecialty) {
        setIsLoading(true);
        setError('');
        try {
          const data = await getTemplates(category, medicalSpecialty);
          setTemplates(data);
        } catch (err) {
          setError('템플릿을 불러오는데 실패했습니다.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTemplates();
  }, [category, medicalSpecialty]);

  // --- Handlers ---
  const handleTemplateSelect = async (templateId: number) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getTemplateDetails(templateId);
      setSelectedTemplate(data);
      setUserInputs({});
      setMediaInfo([]);
    } catch (err) {
      setError('템플릿 상세 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (variableId: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [variableId]: value }));
  };

  const handleMediaSelect = (variableId: string, media: Media) => {
    const newMediaInfo = mediaInfo.filter(m => m.media_id !== media.media_id);
    setMediaInfo([...newMediaInfo, { media_id: media.media_id, description: '' }]);
    handleInputChange(variableId, media.media_id.toString());
  };
  
  const handleMediaDescriptionChange = (mediaId: number, description: string) => {
      setMediaInfo(prev => prev.map(m => m.media_id === mediaId ? { ...m, description } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setIsLoading(true);
    setError('');
    setGeneratedContent(null);

    try {
      const response = await generateIntelligentContent({
        template_id: selectedTemplate.template_id,
        user_inputs: userInputs,
        media_info: mediaInfo
      });
      setGeneratedContent(response);
    } catch (err: any) {
        setError(err.message || '컨텐츠 생성에 실패했습니다.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  // --- Render Functions ---

  const renderStep1_SelectTemplate = () => (
        <div>
      <h2>1단계: 템플릿 선택</h2>
      <div className="form-group">
        <label htmlFor="category">컨텐츠 종류</label>
        <select id="category" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">선택하세요</option>
          <option value="blog">블로그 포스트</option>
          <option value="instagram">인스타그램 피드</option>
          <option value="youtube">유튜브 스크립트</option>
          </select>
        </div>
      <div className="form-group">
        <label htmlFor="medicalSpecialty">진료과목</label>
        <select id="medicalSpecialty" value={medicalSpecialty} onChange={e => setMedicalSpecialty(e.target.value)}>
           <option value="">선택하세요</option>
           <option value="dermatology">피부과</option>
           <option value="plastic_surgery">성형외과</option>
           <option value="orthopedics">정형외과</option>
           <option value="psychiatry">정신건강의학과</option>
          </select>
        </div>
      {isLoading && <p>템플릿을 불러오는 중...</p>}
      <div className="template-list">
        {templates.map(template => (
          <div key={template.template_id} className="template-card" onClick={() => handleTemplateSelect(template.template_id)}>
            <h3>{template.template_name}</h3>
            <p>{template.description}</p>
          </div>
        ))}
      </div>
            </div>
  );

  const renderStep2_FillForm = () => {
    if (!selectedTemplate) return null;
    return (
      <div>
        <button onClick={() => setSelectedTemplate(null)} className="button-secondary">&larr; 템플릿 다시 선택</button>
        <h2>2단계: 정보 입력 ({selectedTemplate.template_name})</h2>
        <form onSubmit={handleSubmit}>
          {selectedTemplate.variables?.map((variable: TemplateVariable) => (
            <div key={variable.id} className="form-group">
              <label htmlFor={variable.id}>{variable.question}</label>
              {variable.type === 'text' && (
                <input id={variable.id} type="text" value={userInputs[variable.id] || ''} onChange={e => handleInputChange(variable.id, e.target.value)} required />
              )}
              {variable.type === 'textarea' && (
                <textarea id={variable.id} value={userInputs[variable.id] || ''} onChange={e => handleInputChange(variable.id, e.target.value)} required rows={5} />
              )}
              {variable.type === 'image_description' && (
                <div className="media-input-group">
                  <p>아래 라이브러리에서 이미지를 선택하거나 새 이미지를 업로드하세요.</p>
                   <MediaLibrary onSelect={(media) => handleMediaSelect(variable.id, media)} />
                   <MediaUploader onUpload={(media) => handleMediaSelect(variable.id, media)} />
                   {mediaInfo.map(mi => (
                       <div key={mi.media_id} className="media-description-item">
                           <p>선택된 이미지 ID: {mi.media_id}</p>
                           <input type="text" placeholder="이 이미지에 대한 설명을 입력하세요 (AI가 참고합니다)" value={mi.description} onChange={(e) => handleMediaDescriptionChange(mi.media_id, e.target.value)} required/>
        </div>
                   ))}
            </div>
          )}
        </div>
          ))}
          <button type="submit" className="button-primary" disabled={isLoading}>
            {isLoading ? '생성 중...' : 'AI 컨텐츠 생성하기'}
          </button>
        </form>
      </div>
    );
  };
  
  const renderStep3_ShowResult = () => {
      if (!generatedContent) return null;
      return (
        <div>
              <h2>3단계: 생성 결과 확인</h2>
              <div className="result-card">
                  <h3>{generatedContent.title}</h3>
                  <div className="result-scores">
                      <span className="score-badge seo">SEO 점수: {generatedContent.seo_score || 'N/A'}/100</span>
                      <span className="score-badge compliance">규정준수 점수: {generatedContent.compliance_score || 'N/A'}/100</span>
                  </div>
                  <div className="result-body" dangerouslySetInnerHTML={{ __html: generatedContent.body.replace(/\n/g, '<br />') }} />
              </div>
              <div className="button-group">
                  <button onClick={() => setGeneratedContent(null)} className="button-secondary">다시 생성하기</button>
                  <button onClick={() => navigate(`/content/${generatedContent.content_id}`)} className="button-primary">상세 정보 및 수정</button>
              </div>
        </div>
      );
  };

  return (
    <div className="content-create-container">
      <h1>새 컨텐츠 생성</h1>
      {error && <div className="error-message">{error}</div>}
      
      {!selectedTemplate && !generatedContent && renderStep1_SelectTemplate()}
      {selectedTemplate && !generatedContent && renderStep2_FillForm()}
      {generatedContent && renderStep3_ShowResult()}
      
    </div>
  );
};

export default ContentCreate;
