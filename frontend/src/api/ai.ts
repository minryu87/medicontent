const API_URL = 'http://localhost:5001/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

interface GenerateContentPayload {
    template_id: number;
    user_inputs: { [key: string]: string };
    media_info: { media_id: number; description: string }[];
}

export const generateIntelligentContent = async (payload: GenerateContentPayload) => {
    const response = await fetch(`${API_URL}/ai/generate-intelligent-content`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.msg || 'Failed to generate content');
    }
    return data;
}; 