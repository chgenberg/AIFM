#!/bin/bash

# Database Backup Script for AIFM Portal
# This script backs up the PostgreSQL database with compression and retention policy

set -e

# Configuration
DB_NAME="${DATABASE_URL:-finans_db}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-.}/backups"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Error handler
error_exit() {
  log "${RED}ERROR: $1${NC}"
  exit 1
}

# Success message
success() {
  log "${GREEN}✓ $1${NC}"
}

# Start backup
log "========================================"
log "Starting database backup..."
log "========================================"

# Check if psql is available
if ! command -v pg_dump &> /dev/null; then
  error_exit "pg_dump not found. Please install PostgreSQL client tools."
fi

# Create backup filename with timestamp
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/finans_backup_${TIMESTAMP}.sql.gz"

# Perform backup
log "Backing up database: ${DB_NAME}"
log "Backup file: ${BACKUP_FILE}"

if PGPASSWORD="${DATABASE_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-password \
  --format=plain \
  --verbose | gzip > "${BACKUP_FILE}"; then
  
  success "Database backup completed successfully"
  
  # Get backup file size
  SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  log "Backup size: ${SIZE}"
  
else
  error_exit "Failed to create database backup"
fi

# Remove old backups (retention policy)
log "Cleaning up old backups (retention: ${RETENTION_DAYS} days)..."

DELETED_COUNT=0
while IFS= read -r old_backup; do
  if [ -f "${old_backup}" ]; then
    log "Removing: ${old_backup}"
    rm -f "${old_backup}"
    ((DELETED_COUNT++))
  fi
done < <(find "${BACKUP_DIR}" -name "finans_backup_*.sql.gz" -mtime +${RETENTION_DAYS})

if [ ${DELETED_COUNT} -gt 0 ]; then
  success "Removed ${DELETED_COUNT} old backup(s)"
else
  log "No old backups to remove"
fi

# List current backups
log ""
log "Current backups in ${BACKUP_DIR}:"
ls -lh "${BACKUP_DIR}"/finans_backup_*.sql.gz 2>/dev/null || log "No backups found"

# Verify backup integrity (optional - compress verification)
log ""
log "Verifying backup integrity..."
if gzip -t "${BACKUP_FILE}" 2>/dev/null; then
  success "Backup integrity verified"
else
  error_exit "Backup integrity check failed"
fi

log ""
log "========================================"
success "Backup process completed successfully!"
log "========================================"
log "Next backup: $(date -d "+1 day" +'%Y-%m-%d %H:%M:%S')"
log ""
