/**
 * Monitoring & Error Tracking Integration
 * Integrates with Sentry for production error tracking
 */

interface MonitoringConfig {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
  debug?: boolean;
}

class MonitoringService {
  private initialized = false;

  init(config: MonitoringConfig) {
    // Only initialize Sentry in browser environment with DSN
    if (typeof window !== 'undefined' && config.dsn) {
      try {
        this.initializeSentry(config);
        this.initialized = true;
      } catch (error) {
        console.warn('Failed to initialize Sentry:', error);
      }
    }
  }

  private initializeSentry(config: MonitoringConfig) {
    // Sentry initialization stub
    // In production, import '@sentry/nextjs' and call:
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.init({
    //   dsn: config.dsn,
    //   environment: config.environment || process.env.NODE_ENV,
    //   tracesSampleRate: config.tracesSampleRate || 1.0,
    //   debug: config.debug || false,
    // });

    if (config.debug) {
      console.log('Monitoring initialized with config:', config);
    }
  }

  /**
   * Track an error
   */
  captureException(error: Error, context?: Record<string, any>) {
    if (this.initialized && typeof window !== 'undefined') {
      // Sentry implementation would go here
      console.error('Error captured:', error, context);
    }
  }

  /**
   * Track a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (this.initialized) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Track a user action
   */
  captureEvent(name: string, data?: Record<string, any>) {
    if (this.initialized) {
      console.log(`Event: ${name}`, data);
    }
  }

  /**
   * Set user context
   */
  setUserContext(userId: string, email?: string) {
    if (this.initialized) {
      // Sentry implementation would go here
      console.log('User context set:', { userId, email });
    }
  }

  /**
   * Clear user context
   */
  clearUserContext() {
    if (this.initialized) {
      console.log('User context cleared');
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, level: string = 'info') {
    if (this.initialized) {
      console.debug(`[BREADCRUMB] ${message}`);
    }
  }

  /**
   * Start transaction for performance tracking
   */
  startTransaction(name: string, op: string = 'http.request') {
    if (!this.initialized) return;

    const transaction = {
      name,
      op,
      finish: () => {
        console.log(`Transaction completed: ${name}`);
      },
    };

    return transaction;
  }
}

export const monitoring = new MonitoringService();

// Initialize on client side
if (typeof window !== 'undefined') {
  monitoring.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    debug: process.env.NODE_ENV === 'development',
  });
}

/**
 * Hook to track page views
 */
export const usePageTracking = (pageName: string) => {
  if (typeof window !== 'undefined') {
    monitoring.addBreadcrumb(`Navigated to ${pageName}`);
    monitoring.captureEvent('pageview', { page: pageName });
  }
};

/**
 * HOC to wrap components with error tracking
 */
export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>
) {
  return (props: P) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      if (error instanceof Error) {
        monitoring.captureException(error, { component: Component.name });
      }
      throw error;
    }
  };
}
