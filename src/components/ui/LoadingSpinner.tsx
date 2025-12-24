"use client";

import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

interface LoadingSpinnerError extends Error {
    component: 'LoadingSpinner';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = "Loading...",
    size = 'md',
    className = ""
}) => {
    const getSizeClasses = (spinnerSize: string): string => {
        try {
            switch (spinnerSize) {
                case 'sm':
                    return 'h-4 w-4';
                case 'md':
                    return 'h-8 w-8';
                case 'lg':
                    return 'h-12 w-12';
                default:
                    return 'h-8 w-8';
            }
        } catch (error) {
            console.warn('[LoadingSpinner] getSizeClasses Error:', error);
            return 'h-8 w-8'; // fallback
        }
    };

    try {
        return (
            <div className={`flex items-center justify-center py-12 ${className}`}>
                <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${getSizeClasses(size)}`}></div>
                {message && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{message}</span>
                )}
            </div>
        );
    } catch (error) {
        const loadingSpinnerError: LoadingSpinnerError = {
            name: 'LoadingSpinnerError',
            message: `Failed to render LoadingSpinner: ${error instanceof Error ? error.message : 'Unknown error'}`,
            component: 'LoadingSpinner'
        };
        console.error('[LoadingSpinner] Render Error:', loadingSpinnerError);

        // Fallback UI
        return (
            <div className={`flex items-center justify-center py-12 ${className}`}>
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        );
    }
};

export default LoadingSpinner;
