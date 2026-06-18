import API from './api';

/**
 * Analytics Service - Fetch admin dashboard analytics
 */

/**
 * Get comprehensive analytics for admin dashboard
 */
export const getAnalytics = async () => {
  try {
    const response = await API.get('/admin/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

/**
 * Get application trends by month
 */
export const getApplicationTrends = async () => {
  try {
    const response = await API.get('/admin/analytics/trends');
    return response.data;
  } catch (error) {
    console.error('Error fetching application trends:', error);
    throw error;
  }
};

/**
 * Get scholarship statistics
 */
export const getScholarshipStats = async () => {
  try {
    const response = await API.get('/admin/analytics/scholarships');
    return response.data;
  } catch (error) {
    console.error('Error fetching scholarship stats:', error);
    throw error;
  }
};
