import API from './api';

export const getProfile = async () => {
    const response = await API.get('/profile');
    return response.data;
};

export const createOrUpdateProfile = async (profileData) => {
    const response = await API.post('/profile', profileData);
    return response.data;
};
