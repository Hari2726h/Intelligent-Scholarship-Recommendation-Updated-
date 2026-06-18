import API from './api';

export const getCollegeDashboard = async () => {
    const response = await API.get('/college/dashboard');
    return response.data;
};

export const getManagedStudents = async () => {
    const response = await API.get('/college/students');
    return response.data;
};

export const getManagedStudentInsights = async (id) => {
    const response = await API.get(`/college/students/${id}/insights`);
    return response.data;
};

export const getGroupedCollegeNotifications = async () => {
    const response = await API.get('/college/notifications/grouped');
    return response.data;
};

export const addManagedStudent = async (studentData) => {
    const response = await API.post('/college/students', studentData);
    return response.data;
};

export const updateManagedStudent = async (id, studentData) => {
    const response = await API.put(`/college/students/${id}`, studentData);
    return response.data;
};

export const notifyEligibleForStudent = async (id) => {
    const response = await API.post(`/college/students/${id}/notify-eligible`);
    return response.data;
};

export const notifyEligibleForAllStudents = async () => {
    const response = await API.post('/college/students/notify-eligible-all');
    return response.data;
};

export const uploadManagedStudentsCsv = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await API.post('/college/students/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
