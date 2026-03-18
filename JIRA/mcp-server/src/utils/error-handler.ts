/**
 * Error handling utilities for JIRA API
 */

import { JiraErrorResponse } from '../types/jira.js';
import { logger } from './logger.js';

export class JiraApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public jiraErrors?: JiraErrorResponse
  ) {
    super(message);
    this.name = 'JiraApiError';
  }
}

export function parseJiraError(error: any, context: string): string {
  logger.error(`${context}:`, error);

  if (error instanceof JiraApiError) {
    const parts = [error.message];

    if (error.jiraErrors?.errorMessages && error.jiraErrors.errorMessages.length > 0) {
      parts.push('Errors: ' + error.jiraErrors.errorMessages.join(', '));
    }

    if (error.jiraErrors?.errors) {
      const fieldErrors = Object.entries(error.jiraErrors.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      if (fieldErrors) {
        parts.push('Field errors: ' + fieldErrors);
      }
    }

    return parts.join('\n');
  }

  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }

  return `${context}: ${String(error)}`;
}

export function sanitizeErrorMessage(message: string): string {
  // Remove sensitive information from error messages
  return message
    .replace(/Authorization: [^\s]+/gi, 'Authorization: [REDACTED]')
    .replace(/Bearer [^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/Basic [^\s]+/gi, 'Basic [REDACTED]');
}
