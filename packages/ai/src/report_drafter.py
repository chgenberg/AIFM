"""
Report Drafting Module
Generates AI-drafted investor reports (Investor Letter, Fund Accounting) using metrics
"""

from typing import Dict, List, Optional
from datetime import datetime
import json

# ============================================================================
# TYPES
# ============================================================================

Metrics = Dict
Report = Dict

# ============================================================================
# REPORT TEMPLATES
# ============================================================================

INVESTOR_LETTER_TEMPLATE = """
# {fund_name} – Monthly Report
**Period:** {period_start} to {period_end}

## Performance Summary

### Net Asset Value (NAV)
- **Current NAV:** ${nav_current:,.2f}
- **Previous NAV:** ${nav_previous:,.2f}
- **Change:** ${nav_change:,.2f} ({nav_change_pct:.2f}%)

### Cash Flow Activity
- **Subscriptions (Inflows):** ${inflow:,.2f}
- **Redemptions (Outflows):** ${outflow:,.2f}
- **Net Cash Flow:** ${net_cash:,.2f}

### Performance Metrics
- **Return (Period):** {return_pct:.2f}%
- **Fees Charged:** ${fees:,.2f}
- **Key Highlights:** {highlights}

## Portfolio Overview

### Asset Allocation (Top 5 Positions)
{position_list}

### Risk Metrics
- **Volatility (30d):** {volatility:.2f}%
- **Sharpe Ratio:** {sharpe:.2f}
- **Max Drawdown:** {max_drawdown:.2f}%

## Commentary
{commentary}

## Important Notice
This report is for informational purposes only and does not constitute investment advice.
Please refer to the fund prospectus for complete details.

---
Generated: {generated_date}
"""

# ============================================================================
# DRAFTING FUNCTIONS
# ============================================================================

def generate_investor_letter(
    fund_name: str,
    period_start: str,
    period_end: str,
    metrics: Metrics,
    positions: List[Dict] = None,
) -> str:
    """Generate investor letter text from metrics."""
    
    nav_current = metrics.get("nav", 0)
    nav_previous = metrics.get("nav_previous", nav_current)
    nav_change = nav_current - nav_previous
    nav_change_pct = (nav_change / nav_previous * 100) if nav_previous != 0 else 0
    
    inflow = metrics.get("inflow", 0)
    outflow = metrics.get("outflow", 0)
    net_cash = inflow - outflow
    
    return_pct = metrics.get("returnPercent", 0)
    fees = metrics.get("feesCharged", 0)
    
    # Build position list
    position_list = ""
    if positions:
        for i, pos in enumerate(positions[:5], 1):
            position_list += f"\n{i}. **{pos.get('name', 'Unknown')}** – {pos.get('weight', 0):.2f}% | ${pos.get('value', 0):,.2f}"
    else:
        position_list = "\nNo position data available."
    
    highlights = _generate_highlights(metrics)
    commentary = _generate_commentary(metrics, nav_change_pct)
    
    # Format report
    report = INVESTOR_LETTER_TEMPLATE.format(
        fund_name=fund_name,
        period_start=period_start,
        period_end=period_end,
        nav_current=nav_current,
        nav_previous=nav_previous,
        nav_change=nav_change,
        nav_change_pct=nav_change_pct,
        inflow=inflow,
        outflow=outflow,
        net_cash=net_cash,
        return_pct=return_pct,
        fees=fees,
        highlights=highlights,
        position_list=position_list,
        volatility=metrics.get("volatility", 0),
        sharpe=metrics.get("sharpeRatio", 0),
        max_drawdown=metrics.get("maxDrawdown", 0),
        commentary=commentary,
        generated_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    
    return report


def generate_financial_report(
    client_name: str,
    period_start: str,
    period_end: str,
    metrics: Metrics,
) -> str:
    """Generate financial reporting summary."""
    
    template = f"""
# Financial Report – {client_name}
**Period:** {period_start} to {period_end}

## Financial Summary

### Income Statement Summary
- **Operating Income:** ${metrics.get('operatingIncome', 0):,.2f}
- **Operating Expenses:** ${metrics.get('operatingExpenses', 0):,.2f}
- **Net Income:** ${metrics.get('netIncome', 0):,.2f}

### Balance Sheet Snapshot
- **Total Assets:** ${metrics.get('totalAssets', 0):,.2f}
- **Total Liabilities:** ${metrics.get('totalLiabilities', 0):,.2f}
- **Equity:** ${metrics.get('equity', 0):,.2f}

### Key Ratios
- **Debt-to-Equity:** {metrics.get('debtToEquity', 0):.2f}
- **Current Ratio:** {metrics.get('currentRatio', 0):.2f}
- **ROE:** {metrics.get('roe', 0):.2f}%

## Notes & Commentary
{metrics.get('commentary', 'No additional commentary provided.')}

---
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """
    
    return template


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _generate_highlights(metrics: Metrics) -> str:
    """Generate key highlights based on metrics."""
    highlights = []
    
    return_pct = metrics.get("returnPercent", 0)
    if return_pct > 5:
        highlights.append(f"Strong return of {return_pct:.2f}% in the period")
    elif return_pct > 0:
        highlights.append(f"Positive return of {return_pct:.2f}%")
    elif return_pct < 0:
        highlights.append(f"Negative return of {return_pct:.2f}%")
    
    concentration = metrics.get("concentration", None)
    if concentration and concentration > 30:
        highlights.append(f"Top 5 positions represent {concentration:.0f}% of fund")
    
    volatility = metrics.get("volatility", None)
    if volatility:
        if volatility > 15:
            highlights.append(f"Elevated volatility at {volatility:.2f}%")
        elif volatility < 5:
            highlights.append(f"Low volatility at {volatility:.2f}%")
    
    if not highlights:
        highlights.append("Fund trading within expected parameters")
    
    return "; ".join(highlights)


def _generate_commentary(metrics: Metrics, nav_change_pct: float) -> str:
    """Generate contextual commentary on performance."""
    
    commentary = []
    
    # Performance commentary
    if nav_change_pct > 10:
        commentary.append("The fund experienced a significant increase in NAV this period, reflecting strong market conditions.")
    elif nav_change_pct > 0:
        commentary.append("The fund NAV increased slightly, driven by positive investment returns.")
    elif nav_change_pct < -10:
        commentary.append("The fund NAV declined notably this period due to market headwinds.")
    elif nav_change_pct < 0:
        commentary.append("The fund NAV experienced a modest decline, offset partially by new subscriptions.")
    
    # Cash flow commentary
    inflow = metrics.get("inflow", 0)
    outflow = metrics.get("outflow", 0)
    if inflow > outflow:
        commentary.append("New investor subscriptions exceeded redemptions, supporting growth.")
    elif outflow > inflow:
        commentary.append("Redemptions exceeded new subscriptions this period.")
    
    # Risk commentary
    volatility = metrics.get("volatility", None)
    if volatility and volatility > 12:
        commentary.append("Market volatility increased during the period. We remain focused on our long-term strategy.")
    
    if not commentary:
        commentary.append("The fund performed in line with expectations during the reporting period.")
    
    return " ".join(commentary)


def extract_metrics_from_ledger(ledger_entries: List[Dict]) -> Dict:
    """Extract basic metrics from ledger entries."""
    
    total_inflow = sum(
        float(e.get("amount", 0))
        for e in ledger_entries
        if e.get("description", "").lower().count("subscription") > 0 and float(e.get("amount", 0)) > 0
    )
    
    total_outflow = sum(
        abs(float(e.get("amount", 0)))
        for e in ledger_entries
        if e.get("description", "").lower().count("redemption") > 0 and float(e.get("amount", 0)) < 0
    )
    
    total_fees = sum(
        abs(float(e.get("amount", 0)))
        for e in ledger_entries
        if "fee" in e.get("description", "").lower() and float(e.get("amount", 0)) < 0
    )
    
    return {
        "inflow": total_inflow,
        "outflow": total_outflow,
        "feesCharged": total_fees,
    }


def draft_report(
    client_id: str,
    report_type: str,
    period_start: str,
    period_end: str,
    metrics: Metrics,
    positions: List[Dict] = None,
    ledger_entries: List[Dict] = None,
) -> Report:
    """Main entry point for report drafting."""
    
    # Extract any missing metrics from ledger if available
    if ledger_entries and not metrics.get("inflow"):
        extracted = extract_metrics_from_ledger(ledger_entries)
        metrics = {**metrics, **extracted}
    
    text = ""
    if report_type == "INVESTOR_REPORT":
        text = generate_investor_letter(
            fund_name=metrics.get("fundName", f"Fund {client_id}"),
            period_start=period_start,
            period_end=period_end,
            metrics=metrics,
            positions=positions,
        )
    elif report_type == "FINANCIAL":
        text = generate_financial_report(
            client_name=metrics.get("clientName", client_id),
            period_start=period_start,
            period_end=period_end,
            metrics=metrics,
        )
    else:
        text = f"# Report – {report_type}\nNo template available for {report_type}."
    
    return {
        "clientId": client_id,
        "type": report_type,
        "period": {
            "start": period_start,
            "end": period_end,
        },
        "text": text,
        "metrics": metrics,
        "html": _markdown_to_html(text),
        "generatedAt": datetime.now().isoformat(),
    }


def _markdown_to_html(markdown: str) -> str:
    """Simple markdown to HTML conversion."""
    html = markdown
    html = html.replace("# ", "<h1>").replace("\n", "</h1>\n")
    html = html.replace("## ", "<h2>").replace("\n", "</h2>\n")
    html = html.replace("**", "<strong>").replace("**", "</strong>")
    html = html.replace("- ", "<li>").replace("\n", "</li>\n")
    return f"<html><body>{html}</body></html>"


# ============================================================================
# ENTRY POINT (for testing)
# ============================================================================

if __name__ == "__main__":
    sample_metrics = {
        "nav": 5000000,
        "nav_previous": 4800000,
        "inflow": 100000,
        "outflow": 50000,
        "returnPercent": 4.17,
        "feesCharged": 12500,
        "volatility": 8.5,
        "sharpeRatio": 1.2,
        "maxDrawdown": 2.5,
        "fundName": "Sample Fund A",
    }
    
    sample_positions = [
        {"name": "Tech Stock A", "weight": 15, "value": 750000},
        {"name": "Bond Index", "weight": 25, "value": 1250000},
        {"name": "Real Estate", "weight": 20, "value": 1000000},
    ]
    
    report = draft_report(
        client_id="client-123",
        report_type="INVESTOR_REPORT",
        period_start="2024-01-01",
        period_end="2024-01-31",
        metrics=sample_metrics,
        positions=sample_positions,
    )
    
    print("Generated Report:")
    print(report["text"])
