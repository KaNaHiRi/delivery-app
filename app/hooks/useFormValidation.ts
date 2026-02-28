import { useState, useCallback } from 'react';
import { z } from 'zod';
import { formatZodErrors } from '@/app/utils/validation';

// C#: ValidationHelper<T> ジェネリッククラス相当
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): data is T => {
      const result = schema.safeParse(data);
      if (result.success) {
        setErrors({});
        return true;
      }
      setErrors(formatZodErrors(result.error));
      return false;
    },
    [schema]
  );

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, clearError, clearAllErrors };
}