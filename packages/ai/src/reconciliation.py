"""
Bank ↔ Ledger Reconciliation Module
Fuzzy-matches bank transactions with ledger entries to identify mismatches
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from difflib import SequenceMatcher
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# TYPES
# ============================================================================

Transaction = Dict
LedgerEntry = Dict
Match = Dict
Delta = Dict

# ============================================================================
# RECONCILIATION FUNCTIONS
# ============================================================================

def fuzzy_match_strings(s1: str, s2: str, threshold: float = 0.8) -> float:
    """Calculate string similarity ratio (0-1)."""
    if not s1 or not s2:
        return 0.0
    return SequenceMatcher(None, s1.lower(), s2.lower()).ratio()


def reconcile_transactions(
    bank_txs: List[Transaction],
    ledger_entries: List[LedgerEntry],
    tolerance_days: int = 3,
    tolerance_amount: float = 0.01,
) -> Tuple[List[Match], List[Delta]]:
    """
    Reconcile bank transactions against ledger entries.
    
    Args:
        bank_txs: List of bank transactions with date, amount, description
        ledger_entries: List of ledger entries from GL
        tolerance_days: Days to tolerate in date differences
        tolerance_amount: Absolute amount tolerance (e.g. 0.01 = 1 cent)
    
    Returns:
        (matched_pairs, unmatched_deltas)
    """
    
    matched_pairs: List[Match] = []
    used_ledger_ids = set()
    unmatched_bank = []
    
    # Try to match each bank transaction to ledger entry
    for bank_tx in bank_txs:
        best_match = None
        best_score = 0
        best_ledger_idx = -1
        
        bank_amount = float(bank_tx.get("amount", 0))
        bank_date = parse_date(bank_tx.get("date"))
        bank_desc = bank_tx.get("description", "").lower()
        
        # Find best matching ledger entry
        for idx, ledger in enumerate(ledger_entries):
            if idx in used_ledger_ids:
                continue
            
            ledger_amount = float(ledger.get("amount", 0))
            ledger_date = parse_date(ledger.get("bookingDate"))
            ledger_desc = ledger.get("description", "").lower()
            
            # Calculate match score
            score = 0
            match_method = []
            
            # Amount match (must be exact or within tolerance)
            if abs(bank_amount - ledger_amount) <= tolerance_amount:
                score += 0.4  # 40% weight for exact amount
                match_method.append("amount")
            else:
                continue  # Skip if amounts don't match
            
            # Date match (within tolerance_days)
            if bank_date and ledger_date:
                days_diff = abs((bank_date - ledger_date).days)
                if days_diff <= tolerance_days:
                    score += 0.3 * (1 - days_diff / tolerance_days)  # 30% weight
                    match_method.append("date")
            
            # Description match (fuzzy string matching)
            if bank_desc and ledger_desc:
                desc_similarity = fuzzy_match_strings(bank_desc, ledger_desc)
                if desc_similarity > 0.5:
                    score += 0.3 * desc_similarity  # 30% weight
                    match_method.append("description")
            
            # Track best match
            if score > best_score:
                best_score = score
                best_match = ledger
                best_ledger_idx = idx
        
        # If found a match above threshold (0.6), record it
        if best_score > 0.6:
            matched_pairs.append({
                "bankTxId": bank_tx.get("id", ""),
                "ledgerEntryId": best_match.get("id", ""),
                "confidence": best_score,
                "matchedOn": match_method,
                "tolerance": tolerance_amount,
            })
            used_ledger_ids.add(best_ledger_idx)
        else:
            unmatched_bank.append(bank_tx)
    
    # Find unmatched ledger entries
    unmatched_ledger = [
        ledger for idx, ledger in enumerate(ledger_entries)
        if idx not in used_ledger_ids
    ]
    
    # Build deltas (differences)
    deltas = []
    
    for bank_tx in unmatched_bank:
        deltas.append({
            "id": f"bank-{bank_tx.get('id', '')}",
            "type": "unmatched_bank",
            "severity": "warning",
            "amount": float(bank_tx.get("amount", 0)),
            "date": bank_tx.get("date", ""),
            "description": bank_tx.get("description", ""),
            "context": {"source": "BANK", "txId": bank_tx.get("id", "")},
        })
    
    for ledger in unmatched_ledger:
        deltas.append({
            "id": f"ledger-{ledger.get('id', '')}",
            "type": "unmatched_ledger",
            "severity": "info",
            "amount": float(ledger.get("amount", 0)),
            "date": ledger.get("bookingDate", ""),
            "description": ledger.get("description", ""),
            "context": {"source": "LEDGER", "entryId": ledger.get("id", "")},
        })
    
    return matched_pairs, deltas


def parse_date(date_str: str) -> datetime:
    """Parse ISO date string to datetime."""
    if not date_str:
        return None
    try:
        if isinstance(date_str, str):
            # Try ISO format first
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return date_str
    except:
        logger.warning(f"Failed to parse date: {date_str}")
        return None


def calculate_totals(transactions: List[Transaction]) -> Dict[str, float]:
    """Calculate total debits, credits, and balance."""
    total_debit = sum(
        float(tx.get("amount", 0))
        for tx in transactions
        if float(tx.get("amount", 0)) > 0
    )
    total_credit = sum(
        abs(float(tx.get("amount", 0)))
        for tx in transactions
        if float(tx.get("amount", 0)) < 0
    )
    
    return {
        "totalDebit": total_debit,
        "totalCredit": total_credit,
        "balance": total_debit - total_credit,
    }


def generate_reconciliation_report(
    client_id: str,
    period_start: str,
    period_end: str,
    bank_txs: List[Transaction],
    ledger_entries: List[LedgerEntry],
) -> Dict:
    """Generate complete reconciliation report."""
    
    matched, deltas = reconcile_transactions(bank_txs, ledger_entries)
    
    bank_totals = calculate_totals(bank_txs)
    ledger_totals = calculate_totals(ledger_entries)
    
    match_rate = len(matched) / max(len(bank_txs), 1) if bank_txs else 0
    variance = abs(bank_totals["balance"] - ledger_totals["balance"])
    
    return {
        "clientId": client_id,
        "period": {
            "start": period_start,
            "end": period_end,
        },
        "matched": matched,
        "deltas": deltas,
        "matchRate": match_rate,
        "bankTotals": bank_totals,
        "ledgerTotals": ledger_totals,
        "variance": variance,
        "status": "PASSED" if variance < 0.01 and match_rate > 0.95 else "REVIEW_REQUIRED",
    }


# ============================================================================
# ENTRY POINT (for testing/CLI)
# ============================================================================

if __name__ == "__main__":
    # Example usage
    bank = [
        {
            "id": "b1",
            "date": "2024-01-15",
            "amount": 1000.00,
            "description": "Invoice 12345",
        },
        {
            "id": "b2",
            "date": "2024-01-16",
            "amount": -500.00,
            "description": "Refund XYZ",
        },
    ]
    
    ledger = [
        {
            "id": "l1",
            "bookingDate": "2024-01-15",
            "amount": 1000.00,
            "description": "Sales Invoice 12345",
        },
        {
            "id": "l2",
            "bookingDate": "2024-01-17",
            "amount": -500.00,
            "description": "Customer Refund",
        },
    ]
    
    matched, deltas = reconcile_transactions(bank, ledger)
    print(f"Matched: {len(matched)} transactions")
    print(f"Deltas: {len(deltas)} differences")
    print(json.dumps({"matched": matched, "deltas": deltas}, indent=2))
