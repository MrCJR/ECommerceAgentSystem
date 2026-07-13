import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global React ErrorBoundary.
 * Catches any unhandled errors in child components and shows a friendly error page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  handleBackHome = () => {
    this.setState({ hasError: false });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
          <Result
            status="500"
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try refreshing the page."
            extra={[
              <Button key="retry" type="primary" onClick={this.handleRetry}>
                Refresh Page
              </Button>,
              <Button key="home" onClick={this.handleBackHome}>
                Back to Dashboard
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
