/**
 * PDF Export Service
 * Generates PDF documents from content
 */

import PDFDocument from 'pdfkit';
import { RAGResponse } from './rag';
import { ComplianceCheckResult } from './compliance-engine';
import { GapAnalysisResult } from './gap-analysis';

/**
 * Export RAG response as PDF
 */
export async function exportRAGResponseToPDF(
  question: string,
  response: RAGResponse,
  _outputPath?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Document Q&A Response', { align: 'center' });
    doc.moveDown();

    // Question
    doc.fontSize(16).text('Question:', { underline: true });
    doc.fontSize(12).text(question);
    doc.moveDown();

    // Answer
    doc.fontSize(16).text('Answer:', { underline: true });
    doc.fontSize(12).text(response.answer);
    doc.moveDown();

    // Sources
    if (response.sources.length > 0) {
      doc.fontSize(16).text('Sources:', { underline: true });
      doc.moveDown(0.5);

      response.sources.forEach((source, index) => {
        doc.fontSize(11).text(`${index + 1}. ${source.fileName}`, { indent: 20 });
        doc.fontSize(9).text(`   Relevance: ${(source.score * 100).toFixed(1)}%`, { indent: 20 });
        doc.fontSize(9).text(`   Excerpt: ${source.excerpt.substring(0, 200)}...`, { indent: 20 });
        doc.moveDown(0.5);
      });
    }

    // Citations
    if (response.citations.length > 0) {
      doc.moveDown();
      doc.fontSize(12).text('Cited Documents:', { underline: true });
      response.citations.forEach((citation, index) => {
        doc.fontSize(10).text(`${index + 1}. ${citation}`, { indent: 20 });
      });
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString('en-US')}`,
      { align: 'center' }
    );

    doc.end();
  });
}

/**
 * Export compliance check as PDF
 */
export async function exportComplianceCheckToPDF(
  documentName: string,
  checks: ComplianceCheckResult[],
  _outputPath?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Compliance Check Report', { align: 'center' });
    doc.moveDown();

    // Document info
    doc.fontSize(14).text('Document:', { underline: true });
    doc.fontSize(12).text(documentName);
    doc.moveDown();

    // Overall status
    const overallCompliant = checks.every(c => c.status === 'COMPLIANT');
    const overallScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;

    doc.fontSize(14).text('Overall Status:', { underline: true });
    doc.fontSize(12).text(
      overallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
      { color: overallCompliant ? 'green' : 'red' }
    );
    doc.fontSize(10).text(`Compliance Score: ${(overallScore * 100).toFixed(1)}%`);
    doc.moveDown();

    // Individual checks
    doc.fontSize(16).text('Policy Checks:', { underline: true });
    doc.moveDown(0.5);

    checks.forEach((check, index) => {
      doc.fontSize(12).text(`${index + 1}. ${check.policyName}`, { indent: 20 });
      doc.fontSize(10).text(`   Requirement: ${check.requirement}`, { indent: 20 });
      doc.fontSize(10).text(`   Status: ${check.status}`, {
        indent: 20,
        color: check.status === 'COMPLIANT' ? 'green' : check.status === 'NON_COMPLIANT' ? 'red' : 'orange',
      });
      doc.fontSize(10).text(`   Score: ${(check.score * 100).toFixed(1)}%`, { indent: 20 });

      if (check.evidence && check.evidence.length > 0) {
        doc.fontSize(9).text(`   Evidence: ${check.evidence.slice(0, 2).join(', ')}`, { indent: 20 });
      }

      if (check.gaps && check.gaps.length > 0) {
        doc.fontSize(9).text(`   Gaps: ${check.gaps.join('; ')}`, { indent: 20, color: 'red' });
      }

      if (check.notes) {
        doc.fontSize(9).text(`   Notes: ${check.notes}`, { indent: 20 });
      }

      doc.moveDown(0.5);
    });

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString('en-US')}`,
      { align: 'center' }
    );

    doc.end();
  });
}

/**
 * Export gap analysis as PDF
 */
export async function exportGapAnalysisToPDF(
  analysis: GapAnalysisResult,
  _outputPath?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Gap Analysis Report', { align: 'center' });
    doc.moveDown();

    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12).text(`Total Gaps: ${analysis.summary.total}`);
    doc.fontSize(12).text(`High Priority: ${analysis.summary.high}`, { color: 'red' });
    doc.fontSize(12).text(`Medium Priority: ${analysis.summary.medium}`, { color: 'orange' });
    doc.fontSize(12).text(`Low Priority: ${analysis.summary.low}`, { color: 'green' });
    doc.moveDown();

    // Gaps by type
    if (Object.keys(analysis.summary.byType).length > 0) {
      doc.fontSize(14).text('Gaps by Type:', { underline: true });
      Object.entries(analysis.summary.byType).forEach(([type, count]) => {
        doc.fontSize(11).text(`${type}: ${count}`, { indent: 20 });
      });
      doc.moveDown();
    }

    // Individual gaps
    if (analysis.gaps.length > 0) {
      doc.fontSize(16).text('Gaps:', { underline: true });
      doc.moveDown(0.5);

      analysis.gaps.forEach((gap, index) => {
        const color = gap.severity === 'high' ? 'red' : gap.severity === 'medium' ? 'orange' : 'green';
        
        doc.fontSize(12).text(`${index + 1}. ${gap.title}`, { indent: 20, color });
        doc.fontSize(10).text(`   Type: ${gap.type}`, { indent: 20 });
        doc.fontSize(10).text(`   Severity: ${gap.severity.toUpperCase()}`, { indent: 20, color });
        doc.fontSize(10).text(`   Description: ${gap.description}`, { indent: 20 });
        
        if (gap.recommendation) {
          doc.fontSize(10).text(`   Recommendation: ${gap.recommendation}`, { indent: 20 });
        }
        
        doc.moveDown(0.5);
      });
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      doc.moveDown();
      doc.fontSize(16).text('Recommendations:', { underline: true });
      analysis.recommendations.forEach((rec, index) => {
        doc.fontSize(11).text(`${index + 1}. ${rec}`, { indent: 20 });
      });
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString('en-US')}`,
      { align: 'center' }
    );

    doc.end();
  });
}

/**
 * Export document list as PDF
 */
export async function exportDocumentListToPDF(
  documents: Array<{
    fileName: string;
    documentType?: string | null;
    category?: string | null;
    status: string;
    uploadedAt: Date;
  }>,
  title: string = 'Document List'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    // Document list
    documents.forEach((docItem, index) => {
      doc.fontSize(12).text(`${index + 1}. ${docItem.fileName}`);
      doc.fontSize(10).text(`   Type: ${docItem.documentType || 'N/A'}`, { indent: 20 });
      doc.fontSize(10).text(`   Category: ${docItem.category || 'N/A'}`, { indent: 20 });
      doc.fontSize(10).text(`   Status: ${docItem.status}`, { indent: 20 });
      doc.fontSize(10).text(`   Uploaded: ${new Date(docItem.uploadedAt).toLocaleDateString('en-US')}`, { indent: 20 });
      doc.moveDown(0.5);
    });

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString('sv-SE')} | Total documents: ${documents.length}`,
      { align: 'center' }
    );

    doc.end();
  });
}

