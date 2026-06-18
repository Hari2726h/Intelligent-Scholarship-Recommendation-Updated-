import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';

/**
 * Enterprise Toast Notification Component
 * Listens to custom 'showToast' events from API interceptor
 */
const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type } = event.detail;
      const id = Date.now();
      
      setToasts(prev => [...prev, { id, message, type }]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    window.addEventListener('showToast', handleToast);
    
    return () => {
      window.removeEventListener('showToast', handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="me-2" />;
      case 'error':
        return <FaExclamationCircle className="me-2" />;
      case 'warning':
        return <FaExclamationTriangle className="me-2" />;
      default:
        return <FaInfoCircle className="me-2" />;
    }
  };

  const getBgClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      default:
        return 'bg-info text-white';
    }
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          onClose={() => removeToast(toast.id)}
          className={getBgClass(toast.type)}
          autohide
          delay={5000}
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto">
              {getIcon(toast.type)}
              {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
            </strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default ToastNotification;
