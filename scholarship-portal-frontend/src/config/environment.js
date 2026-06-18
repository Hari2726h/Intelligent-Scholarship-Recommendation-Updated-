/**
 * Enterprise Environment Configuration
 * Allows different API URLs for development and production
 */
const ENV_CONFIG = {
  development: {
    apiUrl: 'http://localhost:8080',
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.yourdomain.com',
  }
};

const environment = process.env.NODE_ENV || 'development';

export const config = ENV_CONFIG[environment];

export default config;
