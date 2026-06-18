import API from './api';

export const getAllScholarships = async (page = 0, size = 10) => {
    const response = await API.get(`/scholarships?page=${page}&size=${size}`);
    return response.data;
};

export const getEligibleScholarships = async () => {
    const response = await API.get('/scholarships/eligible');
    return response.data;
};

export const createScholarship = async (data) => {
    const response = await API.post('/scholarships', data);
    return response.data;
};

export const deleteScholarship = async (id) => {
    const response = await API.delete(`/scholarships/${id}`);
    return response.data;
};
