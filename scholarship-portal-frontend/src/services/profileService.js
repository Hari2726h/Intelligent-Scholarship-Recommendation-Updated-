import api from './api';

/**
 * Service for profile strength analysis
 */

// Get profile strength analysis
export const getProfileStrength = async () => {
    const response = await api.get('/profile/strength');
    return response.data;
};

const profileService = {
    getProfileStrength,
};

export default profileService;
