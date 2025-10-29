# 🤖 OpenAI Training & Integration Guide

**How to Train AI Models to Understand and Execute Tasks with Your Prisma Database**

---

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Function Calling Architecture](#function-calling-architecture)
4. [Training Your AI](#training-your-ai)
5. [Railway Deployment](#railway-deployment)
6. [Testing & Validation](#testing--validation)
7. [Best Practices](#best-practices)

---

## Overview

When you deploy to Railway with a PostgreSQL database managed by Prisma, your AI needs:

1. **Access to structured data** (your Prisma schema)
2. **Function definitions** (what it can do)
3. **System prompts** (how to think about problems)
4. **Context windows** (what data to consider)

The OpenAI API's "function calling" feature lets you define available actions, and the AI autonomously decides which functions to call and with what parameters.

---

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install openai @prisma/client
```

### 2. Environment Variables

Add these to your `.env.local` (local) and Railway dashboard (production):

```env
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_ORG_ID=org-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Database (automatically set by Railway)
DATABASE_URL=postgresql://user:pass@host/dbname

# Node
NODE_ENV=production
```

### 3. Get Your OpenAI Keys

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key in Settings → API Keys
3. Set organization if needed (Settings → Organization)
4. Keep API key secret!

---

## Function Calling Architecture

### How It Works

```
┌─────────────────┐
│  Your Request   │
│   to AI         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ OpenAI Assistant        │
│ - Reads system prompt   │
│ - Considers context     │
│ - Decides which         │
│   function to call      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Your Backend            │
│ - Executes Function     │
│ - Queries Prisma DB     │
│ - Returns Result        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ AI Continues            │
│ - Processes Result      │
│ - May call more funcs   │
│ - Generates Response    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│   Final Answer  │
│   to User       │
└─────────────────┘
```

### Function Definition Structure

Each function has:

```typescript
{
  type: 'function',
  function: {
    name: 'get_pending_tasks',
    description: 'Fetch tasks that need processing',
    parameters: {
      type: 'object',
      properties: {
        clientId: {
          type: 'string',
          description: 'The client ID'
        }
      },
      required: ['clientId']
    }
  }
}
```

**The `description` field is KEY** — it's how the AI knows what each function does.

---

## Training Your AI

### 1. Define Clear System Prompts

Each task type needs a specific system prompt that "teaches" the AI how to think:

```typescript
const BANK_RECONCILIATION_PROMPT = `You are an expert fund accountant.

When given bank and ledger data:
1. Match transactions by date, amount, and description
2. Flag mismatches with severity levels
3. Calculate reconciliation rate
4. Highlight risks and concerns
5. Provide recommendations

You have access to these functions:
- get_bank_transactions() — fetch bank data
- get_ledger_entries() — fetch GL data
- create_flag() — create issues
- create_report_draft() — save findings

Use them to build a comprehensive analysis.`;
```

### 2. Provide Rich Context

Include actual examples in your prompts:

```typescript
const context = `
Recent tasks processed:
- Task 1: BANK_RECON for Client ABC — Found 3 mismatches
- Task 2: KYC_REVIEW for Client XYZ — Approved, low risk

Current client: ${client.name}
Recent performance: ${client.tier === 'LARGE' ? 'Excellent' : 'Standard'}
`;
```

### 3. Use Few-Shot Examples

Show the AI examples of expected behavior:

```typescript
const exampleExchanges = [
  {
    userInput: 'Review pending bank reconciliation for Client ABC, Jan 2024',
    aiThinkingProcess: 'I need to: 1) Get client context, 2) Fetch bank data, 3) Fetch ledger, 4) Run reconciliation',
    expectedFunctionCalls: ['get_client_context', 'get_bank_transactions', 'get_ledger_entries'],
    expectedOutput: 'Professional reconciliation analysis with flagged items'
  }
];
```

### 4. Iterative Refinement

Track AI performance:

```typescript
// Log every AI decision
logger.info('AI Function Call', {
  taskType: 'BANK_RECON',
  functionCalled: 'get_bank_transactions',
  reasoning: 'AI provided reasoning',
  timestamp: new Date(),
  accuracy: 'manual review result'
});

// Collect feedback
// Month 1: 87% accuracy → refine prompts
// Month 2: 93% accuracy → add edge cases
// Month 3: 96% accuracy → production ready
```

---

## Railway Deployment

### 1. Connect GitHub Repository

1. Go to [railway.app](https://railway.app)
2. Create new project → GitHub
3. Select your FINANS repository
4. Railway auto-detects Next.js + Node backend

### 2. Configure PostgreSQL

```bash
# In Railway dashboard:
1. New → Database → PostgreSQL
2. Link to your project
3. Copy DATABASE_URL
```

### 3. Set Environment Variables

In Railway dashboard → Variables:

```
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-org-id
OPENAI_MODEL=gpt-4-turbo-preview
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### 4. Deploy

```bash
# Push to GitHub
git add .
git commit -m "feat: add OpenAI integration"
git push origin main

# Railway auto-deploys from main branch
# Watch logs in Railway dashboard
```

### 5. Initialize Database

```bash
# In Railway terminal or local connected to Railway DB:
npx prisma migrate deploy
npx prisma db seed
```

---

## Testing & Validation

### 1. Unit Test Function Calling

```typescript
// __tests__/openai-client.test.ts
import { chatWithAI, functionDefinitions } from '@/lib/openai-client';

describe('OpenAI Function Calling', () => {
  it('should identify correct function for bank reconciliation', async () => {
    const response = await chatWithAI(
      [{ role: 'user', content: 'Reconcile bank and ledger for client-123' }],
      BANK_RECONCILIATION_PROMPT
    );
    
    expect(response).toContain('match');
    expect(response).not.toContain('error');
  });

  it('should handle missing parameters gracefully', async () => {
    const response = await chatWithAI(
      [{ role: 'user', content: 'Get tasks' }], // Missing clientId
      GET_TASKS_PROMPT
    );
    
    expect(response).toContain('need') || toContain('missing');
  });
});
```

### 2. Integration Test with Real Data

```typescript
// __tests__/ai-orchestrator.integration.test.ts
import { processBankReconciliation } from '@/lib/ai-orchestrator';

describe('AI Orchestrator Integration', () => {
  it('should process real reconciliation task', async () => {
    const result = await processBankReconciliation(
      'task-123',
      {
        clientId: 'client-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }
    );
    
    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(result.taskId).toBe('task-123');
  });
});
```

### 3. Manual Testing Checklist

- [ ] AI correctly identifies task type
- [ ] AI calls correct functions in right order
- [ ] AI handles API errors gracefully
- [ ] AI respects data boundaries (client isolation)
- [ ] Analysis is coherent and actionable
- [ ] Flags are created with correct severity
- [ ] Database records are updated correctly

---

## Best Practices

### 1. Always Include Context

```typescript
// ❌ Bad
const prompt = `Process this task`;

// ✅ Good
const prompt = `
Fund: ${client.name} (${client.tier} tier)
Client since: ${client.createdAt}
Recent tasks: ${recentTaskCount}
Data quality: ${dataQualityScore}%

Process: ${taskDescription}
`;
```

### 2. Set Clear Temperature & Max Tokens

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages,
  temperature: 0.3, // Lower = more deterministic (good for financial)
  max_tokens: 2000, // Prevent runaway responses
  tools: functionDefinitions,
});
```

### 3. Implement Error Recovery

```typescript
async function callAI(input: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await chatWithAI([{ role: 'user', content: input }], prompt);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(2000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### 4. Log Everything

```typescript
logger.info('AI Task Started', {
  taskId,
  taskKind,
  clientId,
  functionsCalled: [],
  startTime: Date.now(),
});

// Later...
logger.info('AI Task Completed', {
  taskId,
  taskKind,
  functionsUsed: ['get_bank_transactions', 'create_flag'],
  analysisLength: result.analysis.length,
  duration: Date.now() - startTime,
  flagsCreated: 5,
});
```

### 5. Guard Against Prompt Injection

```typescript
// ❌ Dangerous
const userInput = req.query.input; // Could be malicious
const prompt = `${SYSTEM_PROMPT} ${userInput}`;

// ✅ Safe
const userInput = sanitizeInput(req.query.input);
const prompt = SYSTEM_PROMPT;
const messages = [
  { role: 'system', content: prompt },
  { role: 'user', content: userInput }
];
```

### 6. Use Function Calling Properly

```typescript
// ✅ Always use tool_choice to enable functions
const response = await openai.chat.completions.create({
  messages,
  tools: functionDefinitions,
  tool_choice: 'auto', // AI decides if/when to use functions
});

// Handle the response loop
while (response.choices[0].message.tool_calls) {
  const toolCall = response.choices[0].message.tool_calls[0];
  const result = await executeFunctionCall(toolCall);
  
  // Continue conversation with result
}
```

---

## API Costs & Optimization

### Cost Estimation

| Model | Input | Output | Use Case |
|-------|-------|--------|----------|
| GPT-4 Turbo | $0.01/1k | $0.03/1k | Complex analysis |
| GPT-3.5 | $0.50/1m | $1.50/1m | Simple tasks |

**Cost-saving tips:**
- Use GPT-3.5 for simple classifications
- Cache system prompts if possible
- Batch similar requests
- Monitor token usage religiously

```typescript
// Track costs
const inputTokens = response.usage?.prompt_tokens || 0;
const outputTokens = response.usage?.completion_tokens || 0;
const estimatedCost = (inputTokens * 0.01 + outputTokens * 0.03) / 1000;

logger.info('API Cost', { taskId, inputTokens, outputTokens, estimatedCost });
```

---

## Troubleshooting

### AI Returns Gibberish

**Cause:** System prompt is unclear
**Fix:** Add examples and clarify expectations

```typescript
// Before
system: 'Analyze this'

// After
system: `You are a financial analyst. 
Example input: {...}
Example output: {...}
Format responses as JSON.`
```

### Functions Never Get Called

**Cause:** System prompt doesn't mention them
**Fix:** List available functions in prompt

```typescript
const prompt = `You have access to:
1. get_bank_transactions() — fetch bank data
2. get_ledger_entries() — fetch GL
3. create_flag() — create alerts

Use these to complete the analysis.`;
```

### Slow Responses

**Cause:** Calling too many functions
**Fix:** Batch operations or use lower temperature

```typescript
// Before: 10 sequential API calls
for (let i = 0; i < 10; i++) {
  await getPendingTasks(clientId);
}

// After: Parallel calls
const tasks = await Promise.all(
  clients.map(c => getPendingTasks(c.id))
);
```

---

## Next Steps

1. **Deploy to Railway** → Follow deployment section
2. **Run validation tests** → Ensure functions work
3. **Monitor AI decisions** → Track accuracy for 1 week
4. **Refine prompts** → Based on actual usage
5. **Expand functions** → Add more capabilities
6. **Scale to production** → Monitor costs & performance

---

**Questions?** Check OpenAI docs: https://platform.openai.com/docs/guides/function-calling

