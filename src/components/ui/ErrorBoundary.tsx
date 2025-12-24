"use client";

import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log the error to console with component information
        console.error('[ErrorBoundary] Component Error Caught:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString()
        });

        // Call the onError callback if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Update state with error info
        this.setState({
            error,
            errorInfo
        });
    }

    resetError = (): void => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
            }

            // Default fallback UI
            return (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 m-4">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-red-500 dark:text-red-400 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={this.resetError}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                            type="button"
                        >
                            Try Again
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm font-medium text-red-600 dark:text-red-400">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-800 dark:text-red-300 overflow-auto">
                                    {this.state.error.stack}
                                </pre>
                                {this.state.errorInfo && (
                                    <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-800 dark:text-red-300 overflow-auto">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
