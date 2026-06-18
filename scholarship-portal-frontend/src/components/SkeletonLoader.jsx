import React from 'react';
import ContentLoader from 'react-content-loader';

/**
 * Skeleton loader for table rows
 */
export const TableSkeleton = ({ rows = 5 }) => (
  <tbody>
    {Array(rows).fill().map((_, index) => (
      <tr key={index}>
        {Array(6).fill().map((_, colIndex) => (
          <td key={colIndex}>
            <ContentLoader
              speed={2}
              width="100%"
              height={20}
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <rect x="0" y="0" rx="3" ry="3" width="90%" height="16" />
            </ContentLoader>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

/**
 * Skeleton loader for cards
 */
export const CardSkeleton = ({ count = 3 }) => (
  <div className="row">
    {Array(count).fill().map((_, index) => (
      <div className="col-md-4 mb-4" key={index}>
        <ContentLoader
          speed={2}
          width="100%"
          height={200}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="0" rx="5" ry="5" width="100%" height="200" />
        </ContentLoader>
      </div>
    ))}
  </div>
);

/**
 * Simple skeleton without react-content-loader dependency
 */
export const SimpleSkeleton = ({ width = '100%', height = '20px', className = '' }) => (
  <div 
    className={`skeleton ${className}`}
    style={{ 
      width, 
      height,
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}
  />
);

/**
 * Table skeleton without external dependency
 */
export const SimpleTableSkeleton = ({ rows = 5, columns = 6 }) => (
  <tbody>
    {Array(rows).fill().map((_, rowIndex) => (
      <tr key={rowIndex}>
        {Array(columns).fill().map((_, colIndex) => (
          <td key={colIndex}>
            <SimpleSkeleton height="16px" width="90%" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);
