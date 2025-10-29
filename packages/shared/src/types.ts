/**
 * Shared Types - Role-based access control, DB model types, etc.
 */

// ============================================================================
// ENUMS (mirroring Prisma enums)
// ============================================================================

export enum ClientTier {
  XL = "XL",
  LARGE = "LARGE",
}

export enum Plan {
  AGENT_PORTAL = "AGENT_PORTAL",
  COORDINATOR = "COORDINATOR",
  SPECIALIST = "SPECIALIST",
}

export enum Role {
  CLIENT = "CLIENT",
  COORDINATOR = "COORDINATOR",
  SPECIALIST = "SPECIALIST",
  ADMIN = "ADMIN",
}

export enum DataSource {
  FORTNOX = "FORTNOX",
  ALLVUE = "ALLVUE",
  BANK = "BANK",
  SKV = "SKV",
  FI = "FI",
  SIGMA = "SIGMA",
  MANUAL = "MANUAL",
}

export enum TaskKind {
  QC_CHECK = "QC_CHECK",
  KYC_REVIEW = "KYC_REVIEW",
  REPORT_DRAFT = "REPORT_DRAFT",
  BANK_RECON = "BANK_RECON",
  RISK_CALC = "RISK_CALC",
  COMPLIANCE_CHECK = "COMPLIANCE_CHECK",
  INVESTOR_ONBOARD = "INVESTOR_ONBOARD",
}

export enum TaskStatus {
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  NEEDS_REVIEW = "NEEDS_REVIEW",
  DONE = "DONE",
}

export enum ReportType {
  FUND_ACCOUNTING = "FUND_ACCOUNTING",
  INVESTOR_REPORT = "INVESTOR_REPORT",
  FINANCIAL = "FINANCIAL",
  REGULATORY = "REGULATORY",
}

export enum ReportStatus {
  DRAFT = "DRAFT",
  QC = "QC",
  APPROVAL = "APPROVAL",
  PUBLISHED = "PUBLISHED",
}

// ============================================================================
// RBAC & PERMISSIONS
// ============================================================================

export type Permission =
  | "client:read_own"
  | "client:read_all"
  | "datafeeds:manage"
  | "reports:read"
  | "reports:edit"
  | "reports:approve"
  | "tasks:read"
  | "tasks:review"
  | "tasks:assign"
  | "admin:*";

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.CLIENT]: ["client:read_own", "datafeeds:manage", "reports:read"],
  [Role.COORDINATOR]: [
    "client:read_all",
    "datafeeds:manage",
    "reports:read",
    "tasks:read",
    "tasks:review",
  ],
  [Role.SPECIALIST]: [
    "client:read_all",
    "reports:read",
    "reports:edit",
    "reports:approve",
    "tasks:read",
    "tasks:assign",
  ],
  [Role.ADMIN]: ["admin:*"],
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    traceId?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// JOB QUEUE TYPES
// ============================================================================

export interface JobOptions {
  attempts?: number;
  backoff?: {
    type: "exponential" | "fixed";
    delay: number;
  };
  timeout?: number;
  priority?: number;
  removeOnComplete?: boolean;
}

export interface JobProgress {
  current: number;
  total: number;
  percentage: number;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "SYNC"
  | "PUBLISH";

export interface AuditEntry {
  id: string;
  actorId?: string;
  actorRole?: Role;
  action: AuditAction;
  refType: string;
  refId: string;
  diffJson?: {
    before: any;
    after: any;
  };
  ip?: string;
  createdAt: Date;
}

// ============================================================================
// TIME PERIODS
// ============================================================================

export interface Period {
  start: Date;
  end: Date;
}

export function getPeriodString(period: Period): string {
  return `${period.start.toISOString().split("T")[0]}_${period.end
    .toISOString()
    .split("T")[0]}`;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(
      "NOT_FOUND",
      `${resource} with id ${id} not found`,
      404
    );
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}
