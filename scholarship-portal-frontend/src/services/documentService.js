import API from './api';

/**
 * Service for document upload and management
 */

// Upload document
export const uploadDocument = async (file, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await API.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Get my documents
export const getMyDocuments = async () => {
    const response = await API.get('/documents/my');
    return response.data;
};

// Delete document
export const deleteDocument = async (id) => {
    const response = await API.delete(`/documents/${id}`);
    return response.data;
};
