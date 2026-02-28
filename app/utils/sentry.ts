// app/utils/sentry.ts
import * as Sentry from '@sentry/nextjs';

/** APIエラーをSentryに送信 */
export function captureApiError(
  error: unknown,
  context: { endpoint: string; method: string; userId?: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag('layer', 'api');
    scope.setTag('endpoint', context.endpoint);
    scope.setTag('method', context.method);
    if (context.userId) scope.setUser({ id: context.userId });
    Sentry.captureException(error);
  });
}

/** DBエラーをSentryに送信 */
export function captureDbError(
  error: unknown,
  context: { operation: string; model: string }
) {
  Sentry.withScope((scope) => {
    scope.setTag('layer', 'database');
    scope.setTag('operation', context.operation);
    scope.setTag('model', context.model);
    Sentry.captureException(error);
  });
}

/** バリデーションエラーをSentryに送信（警告レベル） */
export function captureValidationError(
  errors: Record<string, string>,
  context: { endpoint: string }
) {
  Sentry.withScope((scope) => {
    scope.setLevel('warning');
    scope.setTag('layer', 'validation');
    scope.setTag('endpoint', context.endpoint);
    scope.setContext('validation_errors', errors);
    Sentry.captureMessage('Validation failed');
  });
}