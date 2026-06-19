import api from './api';

/**
 * Service for scholarship recommendations
 */

// Get personalized recommendations
export const getRecommendations = async () => {
    const response = await api.get('/student/recommendations');
    return response.data;
};

// Get top N recommendations
export const getTopRecommendations = async (limit = 5) => {
    const response = await api.get(`/student/recommendations/top/${limit}`);
    return response.data;
};

// Bookmark a scholarship
export const bookmarkScholarship = async (scholarshipId) => {
    const response = await api.post(`/student/bookmarks/${scholarshipId}`);
    return response.data;
};

// Remove bookmark
export const removeBookmark = async (scholarshipId) => {
    const response = await api.delete(`/student/bookmarks/${scholarshipId}`);
    return response.data;
};

// Get all bookmarked scholarships
export const getBookmarkedScholarships = async () => {
    const response = await api.get  ('/student/bookmarks');
    return response.data;
};

// Check if scholarship is bookmarked
export const isScholarshipBookmarked = async (scholarshipId) => {
    const response = await api.get(`/student/bookmarks/check/${scholarshipId}`);
    return response.data;
};

const recommendationService = {
    getRecommendations,
    getTopRecommendations,
    bookmarkScholarship,
    removeBookmark,
    getBookmarkedScholarships,
    isScholarshipBookmarked,
};

export default recommendationService;
