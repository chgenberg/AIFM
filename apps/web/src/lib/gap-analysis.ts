/**
 * Gap Analysis Service
 * Identifies gaps in compliance and missing documents
 */

import { prisma } from '@/lib/prisma';
import { getDocumentComplianceStatus, checkAllPolicies } from './compliance-engine';

export interface Gap {
  id: string;
  type: 'missing_document' | 'non_compliant' | 'expired' | 'missing_field' | 'policy_violation';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  documentId?: string;
  policyId?: string;
  requirement?: string;
  recommendation?: string;
}

export interface GapAnalysisResult {
  clientId?: string;
  gaps: Gap[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  };
  recommendations: string[];
}

/**
 * Perform gap analysis for a client or document
 */
export async function performGapAnalysis(
  documentId?: string,
  clientId?: string
): Promise<GapAnalysisResult> {
  const gaps: Gap[] = [];

  if (documentId) {
    // Analyze specific document
    const documentGaps = await analyzeDocumentGaps(documentId);
    gaps.push(...documentGaps);
  } else if (clientId) {
    // Analyze all documents for client
    const documents = await prisma.document.findMany({
      where: { clientId },
    });

    for (const doc of documents) {
      const docGaps = await analyzeDocumentGaps(doc.id);
      gaps.push(...docGaps);
    }

    // Check for missing required documents
    const missingDocs = await identifyMissingDocuments(clientId);
    gaps.push(...missingDocs);
  } else {
    // Analyze all documents
    const documents = await prisma.document.findMany({
      where: { status: 'INDEXED' },
    });

    for (const doc of documents) {
      const docGaps = await analyzeDocumentGaps(doc.id);
      gaps.push(...docGaps);
    }
  }

  // Generate summary
  const summary = {
    total: gaps.length,
    high: gaps.filter(g => g.severity === 'high').length,
    medium: gaps.filter(g => g.severity === 'medium').length,
    low: gaps.filter(g => g.severity === 'low').length,
    byType: gaps.reduce((acc, gap) => {
      acc[gap.type] = (acc[gap.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Generate recommendations
  const recommendations = generateRecommendations(gaps);

  return {
    clientId,
    gaps,
    summary,
    recommendations,
  };
}

/**
 * Analyze gaps for a specific document
 */
async function analyzeDocumentGaps(documentId: string): Promise<Gap[]> {
  const gaps: Gap[] = [];

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      complianceChecks: true,
    },
  });

  if (!document) {
    return gaps;
  }

  // Check compliance status
  const complianceStatus = await getDocumentComplianceStatus(documentId);

  if (complianceStatus.overall === 'NON_COMPLIANT') {
    for (const check of complianceStatus.checks) {
      if (check.status === 'NON_COMPLIANT' && check.gaps) {
        for (const gapText of check.gaps) {
          gaps.push({
            id: `${documentId}-${check.policyId}-${gaps.length}`,
            type: 'policy_violation',
            severity: check.score < 0.3 ? 'high' : check.score < 0.7 ? 'medium' : 'low',
            title: `Non-compliance: ${check.requirement}`,
            description: gapText,
            documentId,
            policyId: check.policyId,
            requirement: check.requirement,
            recommendation: `Review and update document to meet requirement: ${check.requirement}`,
          });
        }
      }
    }
  }

  // Check for expired documents
  if (document.expiryDate && new Date(document.expiryDate) < new Date()) {
    gaps.push({
      id: `${documentId}-expired`,
      type: 'expired',
      severity: 'high',
      title: 'Document has expired',
      description: `Document "${document.fileName}" expired on ${document.expiryDate}`,
      documentId,
      recommendation: 'Update or replace expired document',
    });
  }

  // Check for missing required fields
  const missingFields: string[] = [];
  if (!document.title) missingFields.push('title');
  if (!document.extractedText) missingFields.push('extracted text');
  if (!document.documentType) missingFields.push('document type');
  if (!document.category) missingFields.push('category');

  if (missingFields.length > 0) {
    gaps.push({
      id: `${documentId}-missing-fields`,
      type: 'missing_field',
      severity: 'medium',
      title: 'Missing required fields',
      description: `Document is missing: ${missingFields.join(', ')}`,
      documentId,
      recommendation: 'Complete document metadata',
    });
  }

  return gaps;
}

/**
 * Identify missing required documents for a client
 */
async function identifyMissingDocuments(clientId: string): Promise<Gap[]> {
  const gaps: Gap[] = [];

  // Get all active policies
  const policies = await prisma.policy.findMany({
    where: { isActive: true },
  });

  // Get client's documents
  const documents = await prisma.document.findMany({
    where: { clientId },
  });

  // Check each policy for required document types
  for (const policy of policies) {
    const requirements = policy.requirements as any;
    if (!requirements || !requirements.requiredDocuments) {
      continue;
    }

    const requiredTypes = requirements.requiredDocuments as string[];

    for (const requiredType of requiredTypes) {
      const hasDocument = documents.some(
        doc => doc.documentType === requiredType && doc.status === 'INDEXED'
      );

      if (!hasDocument) {
        gaps.push({
          id: `${clientId}-missing-${requiredType}`,
          type: 'missing_document',
          severity: 'high',
          title: `Missing required document: ${requiredType}`,
          description: `Policy "${policy.name}" requires a document of type "${requiredType}"`,
          policyId: policy.id,
          recommendation: `Upload or create a ${requiredType} document`,
        });
      }
    }
  }

  return gaps;
}

/**
 * Generate recommendations based on gaps
 */
function generateRecommendations(gaps: Gap[]): string[] {
  const recommendations: string[] = [];

  // High priority gaps
  const highGaps = gaps.filter(g => g.severity === 'high');
  if (highGaps.length > 0) {
    recommendations.push(
      `Immediate action required: ${highGaps.length} high-priority gaps found. Address expired documents and policy violations first.`
    );
  }

  // Missing documents
  const missingDocs = gaps.filter(g => g.type === 'missing_document');
  if (missingDocs.length > 0) {
    recommendations.push(
      `Upload ${missingDocs.length} missing required document(s) to ensure full compliance.`
    );
  }

  // Non-compliant documents
  const nonCompliant = gaps.filter(g => g.type === 'policy_violation');
  if (nonCompliant.length > 0) {
    recommendations.push(
      `Review and update ${nonCompliant.length} non-compliant document(s) to meet policy requirements.`
    );
  }

  // Missing fields
  const missingFields = gaps.filter(g => g.type === 'missing_field');
  if (missingFields.length > 0) {
    recommendations.push(
      `Complete metadata for ${missingFields.length} document(s) with missing required fields.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('No gaps found. All documents are compliant.');
  }

  return recommendations;
}

/**
 * Create tasks for gaps that need action
 */
export async function createTasksForGaps(gaps: Gap[], assignedTo?: string): Promise<void> {
  for (const gap of gaps) {
    if (gap.severity === 'high' || gap.severity === 'medium') {
      await prisma.task.create({
        data: {
          clientId: gap.documentId ? undefined : undefined, // Will need to get from document
          kind: 'QC_CHECK',
          title: `Fix gap: ${gap.title}`,
          description: gap.description + (gap.recommendation ? `\n\nRecommendation: ${gap.recommendation}` : ''),
          status: 'NEEDS_REVIEW',
          priority: gap.severity === 'high' ? 'HIGH' : 'MEDIUM',
          assigneeId: assignedTo,
        },
      });
    }
  }
}

