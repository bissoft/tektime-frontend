import React, { useState, useEffect } from 'react';

const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleError = (error, errorInfo) => {
            setHasError(true);
            // You can log the error to a logging service here
            console.error('Error caught by ErrorBoundary:', error, errorInfo);
        };

        // Register the error handler
        window.addEventListener('error', handleError);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('error', handleError);
        };
    }, []);

    if (hasError) {
        // You can render a custom fallback UI here
        return <h1>Something went wrong.</h1>;
    }

    return children;
};

export default ErrorBoundary;
