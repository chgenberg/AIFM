/**
 * OpenAI Client with Function Calling
 * 
 * This module handles all OpenAI API interactions with function definitions
 * that map to our Prisma database operations.
 */

import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { logger } from '@/../../../libs/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

// ============================================================================
// FUNCTION DEFINITIONS
// ============================================================================

/**
 * Define all functions that OpenAI can call
 * These map 1:1 to database operations
 */
export const functionDefinitions: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_client_context',
      description: 'Fetch client information and recent tasks to understand the context',
      parameters: {
        type: 'object',
        properties: {
          clientId: {
            type: 'string',
            description: 'The client ID from Prisma',
          },
          includeTasks: {
            type: 'boolean',
            description: 'Whether to include recent tasks (default: true)',
          },
        },
        required: ['clientId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pending_tasks',
      description: 'Get all pending tasks for a client that need processing',
      parameters: {
        type: 'object',
        properties: {
          clientId: {
            type: 'string',
            description: 'The client ID',
          },
          taskKind: {
            type: 'string',
            enum: ['QC_CHECK', 'KYC_REVIEW', 'REPORT_DRAFT', 'BANK_RECON', 'RISK_CALC', 'COMPLIANCE_CHECK', 'INVESTOR_ONBOARD'],
            description: 'Filter by task type (optional)',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of tasks to return (default: 10)',
          },
        },
        required: ['clientId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_bank_transactions',
      description: 'Retrieve bank transactions for reconciliation analysis',
      parameters: {
        type: 'object',
        properties: {
          clientId: {
            type: 'string',
            description: 'The client ID',
          },
          startDate: {
            type: 'string',
            description: 'ISO date string for period start',
          },
          endDate: {
            type: 'string',
            description: 'ISO date string for period end',
          },
          account: {
            type: 'string',
            description: 'Optional: filter by specific account',
          },
        },
        required: ['clientId', 'startDate', 'endDate'],
      },
    },
  },
];

export default openai;
