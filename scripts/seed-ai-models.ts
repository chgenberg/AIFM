import { PrismaClient, TaskKind } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to migrate existing hardcoded prompts to Knowledge Base
 * Run: npx tsx scripts/seed-ai-models.ts
 */
async function main() {
  console.log('🌱 Seeding AI Models...');

  // Bank Reconciliation Model
  const bankReconModel = await prisma.aIModel.create({
    data: {
      name: 'bank-recon-expert',
      version: '1.0.0',
      description: 'Expert model for bank reconciliation tasks',
      taskKind: 'BANK_RECON',
      isDefault: true,
      isActive: true,
      settings: {
        verbosity: 'medium',
        reasoning_effort: 'standard',
      },
      prompts: {
        create: [
          {
            role: 'system',
            order: 0,
            content: `You are an expert in fund accounting and bank reconciliation with 15 years of experience. Your task is to:

1. Compare bank statements with ledger entries
2. Identify discrepancies and their causes
3. Classify deviations:
   - ERROR: Critical issues that need immediate attention (>10,000 SEK or missing transactions)
   - WARNING: Issues that should be reviewed (timing differences, rounding errors)
   - INFO: Normal reconciliation items (timing differences <5 days, small amounts)

4. Provide concrete recommendations for action

DOMAIN KNOWLEDGE:
- Timing differences are COMMON and usually normal (not critical)
- Amounts under 10,000 SEK are often rounding errors
- Management fees are typically debited monthly
- Capital calls appear as large inflows
- Swedish fund regulations require reconciliation T+3

Always return a JSON object with this exact structure:
{
  "analysis": "Detailed analysis of discrepancies and their causes",
  "discrepancies": [
    {
      "type": "TIMING_DIFFERENCE|MISSING_TRANSACTION|INCORRECT_AMOUNT|ROUNDING_ERROR|OTHER",
      "amount": number,
      "date": "ISO-date",
      "explanation": "Explanation"
    }
  ],
  "recommendations": ["Action 1", "Action 2"],
  "flags": [
    {
      "severity": "error|warning|info",
      "message": "Message",
      "code": "CODE"
    }
  ]
}`,
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Timing Difference - Management Fee',
            tags: ['timing-difference', 'fee', 'common-case'],
            input: {
              bankBalance: 125000000,
              ledgerBalance: 124950000,
              discrepancy: 50000,
              recentTransactions: [
                { date: '2024-01-15', amount: 5000000, type: 'inflow', description: 'Capital call' },
                { date: '2024-01-16', amount: -50000, type: 'fee', description: 'Management fee' }
              ]
            },
            output: {
              analysis: 'Bank shows 125M SEK while ledger shows 124.95M SEK. Discrepancy of 50K SEK. Likely cause: management fee debited by bank 2024-01-16 but not yet posted in ledger.',
              discrepancies: [
                {
                  type: 'TIMING_DIFFERENCE',
                  amount: 50000,
                  date: '2024-01-16',
                  explanation: 'Management fee debited by bank but pending in ledger'
                }
              ],
              recommendations: [
                'Verify that 50K fee is correct',
                'Post in ledger to reconcile'
              ],
              flags: [
                {
                  severity: 'info',
                  message: 'Timing difference detected - normal reconciliation item',
                  code: 'TIMING_DIFF'
                }
              ]
            },
          },
          {
            name: 'Missing Transaction - Large Amount',
            tags: ['missing-transaction', 'high-amount', 'critical'],
            input: {
              bankBalance: 150000000,
              ledgerBalance: 148000000,
              discrepancy: 2000000,
              recentTransactions: [
                { date: '2024-01-20', amount: 2000000, type: 'inflow', description: 'Unknown deposit' }
              ]
            },
            output: {
              analysis: 'Bank shows 150M SEK while ledger shows 148M SEK. Large discrepancy of 2M SEK. Bank shows incoming transaction of 2M SEK on 2024-01-20 that is not present in ledger. This requires immediate investigation.',
              discrepancies: [
                {
                  type: 'MISSING_TRANSACTION',
                  amount: 2000000,
                  date: '2024-01-20',
                  explanation: 'Large incoming transaction not recorded in ledger'
                }
              ],
              recommendations: [
                'Verify transaction origin and purpose',
                'Check if this is a capital call or other expected transaction',
                'Post transaction in ledger after verification'
              ],
              flags: [
                {
                  severity: 'error',
                  message: 'Large missing transaction detected - requires immediate review',
                  code: 'MISSING_LARGE_TXN'
                }
              ]
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created Bank Reconciliation Model:', bankReconModel.id);

  // KYC Review Model
  const kycModel = await prisma.aIModel.create({
    data: {
      name: 'kyc-review-expert',
      version: '1.0.0',
      description: 'Expert model for KYC compliance review',
      taskKind: 'KYC_REVIEW',
      isDefault: true,
      isActive: true,
      settings: {
        verbosity: 'high',
        reasoning_effort: 'standard',
      },
      prompts: {
        create: [
          {
            role: 'system',
            order: 0,
            content: `You are a compliance officer and compliance expert with 10 years of experience in financial services. Your task is to review KYC (Know Your Customer) documents:

1. Verify investor identity
2. Assess risk level (low, medium, high):
   - LOW: Established institutions, verified documents, clear ownership
   - MEDIUM: Individual investors, some documentation gaps
   - HIGH: Complex ownership structures, PEP connections, incomplete documentation

3. Check PEP status (politically exposed person)
4. Check sanctions lists
5. Analyze ownership structure (UBO - Ultimate Beneficial Owner)

REGULATORY REQUIREMENTS:
- Swedish AML regulations (Penningtvättslagen)
- EU 4th AML Directive
- FATF recommendations
- All UBOs with >25% ownership must be identified

Always return a JSON object:
{
  "approved": true|false,
  "riskLevel": "low|medium|high",
  "pepStatus": "clear|flagged",
  "sanctionStatus": "clear|flagged",
  "issues": ["Problem 1", "Problem 2"],
  "recommendedActions": ["Action 1", "Action 2"]
}`,
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Low Risk - Institutional Investor',
            tags: ['low-risk', 'institutional', 'approved'],
            input: {
              investorName: 'Pension Fund Sweden',
              kycStatus: 'PENDING',
              kycRiskLevel: null,
              pepStatus: null,
              sanctionStatus: null,
              documentUrl: 'https://example.com/docs/kyc.pdf',
              uboTree: {
                owners: [
                  { name: 'Swedish State', ownership: 100 }
                ]
              }
            },
            output: {
              approved: true,
              riskLevel: 'low',
              pepStatus: 'clear',
              sanctionStatus: 'clear',
              issues: [],
              recommendedActions: ['Approve KYC application', 'Add to approved investor list']
            },
          },
          {
            name: 'High Risk - PEP Connection',
            tags: ['high-risk', 'pep', 'rejection'],
            input: {
              investorName: 'Individual Investor A',
              kycStatus: 'PENDING',
              pepStatus: 'flagged',
              sanctionStatus: 'clear',
              uboTree: {
                owners: [
                  { name: 'Individual Investor A', ownership: 100 }
                ]
              }
            },
            output: {
              approved: false,
              riskLevel: 'high',
              pepStatus: 'flagged',
              sanctionStatus: 'clear',
              issues: [
                'PEP status flagged - requires enhanced due diligence',
                'Incomplete ownership structure documentation'
              ],
              recommendedActions: [
                'Conduct enhanced due diligence',
                'Obtain additional documentation',
                'Senior management approval required'
              ]
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created KYC Review Model:', kycModel.id);

  // Report Draft Model
  const reportModel = await prisma.aIModel.create({
    data: {
      name: 'report-draft-expert',
      version: '1.0.0',
      description: 'Expert model for fund accounting report generation',
      taskKind: 'REPORT_DRAFT',
      isDefault: true,
      isActive: true,
      settings: {
        verbosity: 'high',
        reasoning_effort: 'high',
      },
      prompts: {
        create: [
          {
            role: 'system',
            order: 0,
            content: `You are a professional fund accounting report writer with 15 years of experience. Your task is to:

1. Summarize fund performance
2. Analyze portfolio holdings
3. Assess risks
4. Write a professional, readable report

REPORT STRUCTURE:
- Executive Summary
- Performance Overview
- Portfolio Composition
- Risk Assessment
- Regulatory Compliance
- Appendices

STYLE GUIDE:
- Professional but accessible
- Use clear headings and subheadings
- Include relevant metrics and KPIs
- Follow Swedish fund accounting standards

Write report in Markdown format with clear structure.
Return JSON: { "report": "Markdown-text" }`,
          },
        ],
      },
      examples: {
        create: [
          {
            name: 'Monthly Fund Accounting Report',
            tags: ['monthly', 'standard', 'fund-accounting'],
            input: {
              clientName: 'Test Fund',
              reportType: 'FUND_ACCOUNTING',
              periodStart: '2024-01-01',
              periodEnd: '2024-01-31',
              bankTransactions: 145,
              ledgerEntries: 142,
              investors: 25,
              totalBalance: 125000000,
            },
            output: {
              report: `# Fund Accounting Report - January 2024

## Executive Summary
Test Fund showed strong performance in January 2024 with a total balance of 125M SEK...

## Performance Overview
- Total Assets: 125,000,000 SEK
- Number of Transactions: 145
- Number of Investors: 25

## Portfolio Composition
[Analysis of holdings]

## Risk Assessment
[Risk analysis]

## Regulatory Compliance
All regulatory requirements have been met...`
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created Report Draft Model:', reportModel.id);

  // Create some Knowledge Base entries
  const knowledgeEntries = [
    {
      category: 'regulation',
      title: 'Swedish Fund Accounting Regulations',
      content: `# Swedish Fund Accounting Regulations

## Key Requirements
- NAV calculation must be completed T+3
- Monthly reporting required
- All transactions must be reconciled
- Investor KYC must be completed before onboarding`,
      tags: ['regulation', 'compliance', 'nav'],
    },
    {
      category: 'workflow',
      title: 'Bank Reconciliation Best Practices',
      content: `# Bank Reconciliation Best Practices

## Common Issues
1. Timing differences are normal - flag as INFO
2. Amounts <10,000 SEK are often rounding errors
3. Management fees typically appear monthly
4. Capital calls appear as large single transactions`,
      tags: ['workflow', 'bank-recon', 'best-practices'],
    },
    {
      category: 'common-issues',
      title: 'KYC Common Issues',
      content: `# KYC Common Issues and Solutions

## Missing Documents
- Identity verification: Request passport or national ID
- Address proof: Request utility bill or bank statement
- Ownership structure: Request corporate registry extract

## PEP Checks
- All investors must be checked against PEP databases
- Enhanced due diligence required for flagged individuals`,
      tags: ['kyc', 'compliance', 'common-issues'],
    },
  ];

  for (const entry of knowledgeEntries) {
    await prisma.aIKnowledgeBase.create({
      data: entry,
    });
  }

  console.log('✅ Created Knowledge Base entries');

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

