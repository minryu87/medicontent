import { Template } from '../types';

const API_URL = 'http://localhost:5001/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getTemplates = async (category: string, medicalSpecialty: string): Promise<Template[]> => {
    const response = await fetch(`${API_URL}/content/templates?category=${category}&medical_specialty=${medicalSpecialty}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch templates');
    }
    return response.json();
};

export const getTemplateDetails = async (templateId: number): Promise<Template> => {
    const response = await fetch(`${API_URL}/content/templates/${templateId}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Failed to fetch template details');
    }
    return response.json();
}; 