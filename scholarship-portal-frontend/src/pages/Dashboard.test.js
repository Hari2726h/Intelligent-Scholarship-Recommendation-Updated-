import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Dashboard from './Dashboard';

/**
 * Unit tests for Dashboard component
 */
describe('Dashboard Component', () => {
  const mockAuthContext = {
    isAuthenticated: true,
    user: 'Test User',
    role: 'ROLE_STUDENT',
    login: jest.fn(),
    logout: jest.fn(),
  };

  const renderWithContext = (component) => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  test('renders dashboard for authenticated user', () => {
    renderWithContext(<Dashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  test('displays user role correctly', () => {
    renderWithContext(<Dashboard />);
    // Add more specific assertions based on your Dashboard component
  });
});
