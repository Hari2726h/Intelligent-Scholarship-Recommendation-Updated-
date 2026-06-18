import API from './api';

export const getMyNotifications = async () => {
    const response = await API.get('/notifications/my');
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await API.get('/notifications/unread-count');
    return response.data;
};

export const markNotificationAsRead = async (id) => {
    const response = await API.put(`/notifications/read/${id}`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await API.put('/notifications/read-all');
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
};
