/**
 * Word Export Service
 * Generates Word documents from content
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { RAGResponse } from './rag';
import { ComplianceCheckResult } from './compliance-engine';
import { GapAnalysisResult } from './gap-analysis';

/**
 * Export RAG response as Word document
 */
export async function exportRAGResponseToWord(
  question: string,
  response: RAGResponse
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Document Q&A Response',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            text: 'Question',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun(question)],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            text: 'Answer',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun(response.answer)],
          }),
          new Paragraph({ text: '' }),

          ...(response.sources.length > 0
            ? [
                new Paragraph({
                  text: 'Sources',
                  heading: HeadingLevel.HEADING_1,
                }),
                ...response.sources.map(
                  (source, index) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}. ${source.fileName}`,
                          bold: true,
                        }),
                        new TextRun(`\n   Relevance: ${(source.score * 100).toFixed(1)}%`),
                        new TextRun(`\n   Excerpt: ${source.excerpt.substring(0, 200)}...`),
                      ],
                    })
                ),
                new Paragraph({ text: '' }),
              ]
            : []),

          ...(response.citations.length > 0
            ? [
                new Paragraph({
                  text: 'Cited Documents',
                  heading: HeadingLevel.HEADING_1,
                }),
                ...response.citations.map(
                  (citation, index) =>
                    new Paragraph({
                      children: [new TextRun(`${index + 1}. ${citation}`)],
                    })
                ),
                new Paragraph({ text: '' }),
              ]
            : []),

          new Paragraph({
            text: `Generated on ${new Date().toLocaleString('sv-SE')}`,
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Export compliance check as Word document
 */
export async function exportComplianceCheckToWord(
  documentName: string,
  checks: ComplianceCheckResult[]
): Promise<Buffer> {
  const overallCompliant = checks.every(c => c.status === 'COMPLIANT');
  const overallScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Compliance Check Report',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            text: 'Document',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun(documentName)],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            text: 'Overall Status',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
                color: overallCompliant ? '008000' : 'FF0000',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [new TextRun(`Compliance Score: ${(overallScore * 100).toFixed(1)}%`)],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            text: 'Policy Checks',
            heading: HeadingLevel.HEADING_1,
          }),
          ...checks.flatMap((check, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. ${check.policyName}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun(`   Requirement: ${check.requirement}`)],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `   Status: ${check.status}`,
                  color:
                    check.status === 'COMPLIANT'
                      ? '008000'
                      : check.status === 'NON_COMPLIANT'
                      ? 'FF0000'
                      : 'FFA500',
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun(`   Score: ${(check.score * 100).toFixed(1)}%`)],
            }),
            ...(check.evidence && check.evidence.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun(`   Evidence: ${check.evidence.slice(0, 2).join(', ')}`),
                    ],
                  }),
                ]
              : []),
            ...(check.gaps && check.gaps.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `   Gaps: ${check.gaps.join('; ')}`,
                        color: 'FF0000',
                      }),
                    ],
                  }),
                ]
              : []),
            ...(check.notes
              ? [
                  new Paragraph({
                    children: [new TextRun(`   Notes: ${check.notes}`)],
                  }),
                ]
              : []),
            new Paragraph({ text: '' }),
          ]),

          new Paragraph({
            text: `Generated on ${new Date().toLocaleString('sv-SE')}`,
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Export gap analysis as Word document
 */
export async function exportGapAnalysisToWord(analysis: GapAnalysisResult): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Gap Analysis Report',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),

          new Paragraph({
            text: 'Summary',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [new TextRun(`Total Gaps: ${analysis.summary.total}`)],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `High Priority: ${analysis.summary.high}`,
                color: 'FF0000',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Medium Priority: ${analysis.summary.medium}`,
                color: 'FFA500',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Low Priority: ${analysis.summary.low}`,
                color: '008000',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          ...(Object.keys(analysis.summary.byType).length > 0
            ? [
                new Paragraph({
                  text: 'Gaps by Type',
                  heading: HeadingLevel.HEADING_1,
                }),
                ...Object.entries(analysis.summary.byType).map(
                  ([type, count]) =>
                    new Paragraph({
                      children: [new TextRun(`${type}: ${count}`)],
                    })
                ),
                new Paragraph({ text: '' }),
              ]
            : []),

          ...(analysis.gaps.length > 0
            ? [
                new Paragraph({
                  text: 'Gaps',
                  heading: HeadingLevel.HEADING_1,
                }),
                ...analysis.gaps.flatMap((gap, index) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${index + 1}. ${gap.title}`,
                        bold: true,
                        color: gap.severity === 'high' ? 'FF0000' : gap.severity === 'medium' ? 'FFA500' : '008000',
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [new TextRun(`   Type: ${gap.type}`)],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `   Severity: ${gap.severity.toUpperCase()}`,
                        color: gap.severity === 'high' ? 'FF0000' : gap.severity === 'medium' ? 'FFA500' : '008000',
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [new TextRun(`   Description: ${gap.description}`)],
                  }),
                  ...(gap.recommendation
                    ? [
                        new Paragraph({
                          children: [new TextRun(`   Recommendation: ${gap.recommendation}`)],
                        }),
                      ]
                    : []),
                  new Paragraph({ text: '' }),
                ]),
              ]
            : []),

          ...(analysis.recommendations.length > 0
            ? [
                new Paragraph({
                  text: 'Recommendations',
                  heading: HeadingLevel.HEADING_1,
                }),
                ...analysis.recommendations.map(
                  (rec, index) =>
                    new Paragraph({
                      children: [new TextRun(`${index + 1}. ${rec}`)],
                    })
                ),
              ]
            : []),

          new Paragraph({
            text: `Generated on ${new Date().toLocaleString('sv-SE')}`,
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

