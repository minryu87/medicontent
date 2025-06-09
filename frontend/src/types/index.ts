export interface Template {
  template_id: number;
  template_name: string;
  category: string;
  medical_specialty: string;
  description: string;
  variables?: TemplateVariable[];
}

export interface TemplateVariable {
  id: string; // This can remain 'id' as it's internal to the template variable logic
  question: string;
  type: 'text' | 'textarea' | 'image_description';
}

export interface Media {
  media_id: number;
  url: string;
  alt_text?: string;
  description?: string;
}

export interface Content {
  content_id: number;
  title: string;
  body: string;
  content_type: string;
  medical_specialty: string;
  target_audience: string;
  created_at: string;
  updated_at: string;
  author_id: number;
  seo_score?: number;
  compliance_score?: number;
  associated_media?: Media[];
} 