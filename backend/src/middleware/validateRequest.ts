import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { createAppError } from './errorHandler';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ValidationError) => ({
      field: 'path' in error ? error.path : 'param' in error ? error.param : 'unknown',
      message: error.msg,
      value: 'value' in error ? error.value : undefined,
    }));

    const error = createAppError('Validation failed', 400);
    res.status(400).json({
      error: error.message,
      details: errorMessages,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};