import API from './api';

export const applyForScholarship = async (scholarshipId) => {
    const response = await API.post(`/applications/apply/${scholarshipId}`);
    return response.data;
};

export const getMyApplications = async () => {
    const response = await API.get('/applications/my');
    return response.data;
};

export const getAllApplications = async (page = 0, size = 10) => {
    const response = await API.get(`/applications/all?page=${page}&size=${size}`);
    return response.data;
};
