import os
import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import settings

def generate_pdf_report(report_data: Dict[str, Any]) -> str:
    """
    Generates a high-quality enterprise SOC incident and attack forecast PDF report.
    Returns the absolute filepath to the created PDF.
    """
    report_id = report_data.get("report_id", f"REP-{int(datetime.datetime.utcnow().timestamp())}")
    filename = f"{report_id}.pdf"
    filepath = os.path.join(settings.REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles matching SOC theme
    title_style = ParagraphStyle(
        'SOCTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#080B12'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'SOCSub',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#4F8CFF'),
        fontName='Helvetica-Bold'
    )
    section_style = ParagraphStyle(
        'SOCSection',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#151B27'),
        fontName='Helvetica-Bold',
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'SOCBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#252D3A')
    )
    callout_style = ParagraphStyle(
        'SOCCallout',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F1420')
    )

    elements = []

    # 1. Header Banner
    elements.append(Paragraph("SPECTRUM AI NETWORK SECURITY & FORECASTING PLATFORM", subtitle_style))
    elements.append(Paragraph("Threat Forecast & Incident Intelligence Report", title_style))
    elements.append(Spacer(1, 6))

    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    meta_table_data = [
        [Paragraph(f"<b>Report ID:</b> {report_id}", body_style), Paragraph(f"<b>Generated At:</b> {now_str}", body_style)],
        [Paragraph(f"<b>Classification:</b> TLP:AMBER / SOC CONFIDENTIAL", body_style), Paragraph(f"<b>Platform Engine:</b> SPECTRUM RF-Temporal Engine v2.4", body_style)]
    ]
    meta_table = Table(meta_table_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F3F5F7')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # 2. Executive Summary
    elements.append(Paragraph("1. Executive Summary", section_style))
    summary_text = report_data.get("summary") or (
        "The SPECTRUM AI Network Security Platform detected high-velocity anomalous flow patterns "
        "targeting enterprise production assets. Predictive behavioral analysis indicated imminent malicious saturation "
        "prior to peak attack escalation. Immediate defensive controls and mitigation workflows were initiated."
    )
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 10))

    # 3. Key Threat & Forecast Metrics Table
    elements.append(Paragraph("2. Threat State & Attack Forecast Analysis", section_style))
    forecast = report_data.get("forecast", {})
    metrics_data = [
        [Paragraph("<b>Metric</b>", body_style), Paragraph("<b>Observed Value</b>", body_style), Paragraph("<b>SOC Evaluation</b>", body_style)],
        [Paragraph("Current Threat State", body_style), Paragraph(str(forecast.get("current_threat_state", "Critical")), body_style), Paragraph("Active incident threshold breached", body_style)],
        [Paragraph("Overall Attack Risk Score", body_style), Paragraph(f"{forecast.get('overall_risk_score', 92.4)}% / 100", body_style), Paragraph("Extreme probability of operational degradation", body_style)],
        [Paragraph("Threat Forecast", body_style), Paragraph(str(forecast.get("predicted_attack", "DDoS")), body_style), Paragraph("Multi-source volumetric packet flood", body_style)],
        [Paragraph("Forecast Early-Warning Horizon", body_style), Paragraph(f"{forecast.get('forecast_horizon_seconds', 45)} seconds", body_style), Paragraph("Advance warning prior to service saturation", body_style)],
        [Paragraph("Prediction Confidence", body_style), Paragraph(f"{forecast.get('confidence_score', 0.96) * 100:.1f}%", body_style), Paragraph("High statistical certainty (RF + Isolation)", body_style)],
    ]
    metrics_table = Table(metrics_data, colWidths=[150, 160, 210])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F1420')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(metrics_table)
    elements.append(Spacer(1, 12))

    # 4. Incident Details & MITRE ATT&CK Mapping
    elements.append(Paragraph("3. Incident Context & MITRE ATT&CK Mapping", section_style))
    incident_num = report_data.get("incident_number", "INC-2026-0917-0042")
    mitre_data = [
        [Paragraph("<b>Incident Reference:</b>", body_style), Paragraph(incident_num, body_style)],
        [Paragraph("<b>Targeted Assets:</b>", body_style), Paragraph("10.0.1.15 (web-prod-01.corp), 10.0.1.1 (gw-perimeter-fw.corp)", body_style)],
        [Paragraph("<b>MITRE Technique ID:</b>", body_style), Paragraph("T1498 - Network Denial of Service (Tactic: Impact)", body_style)],
        [Paragraph("<b>Detection Vector:</b>", body_style), Paragraph("Continuous flow behavioral velocity & SYN/RST ratio divergence", body_style)],
    ]
    mitre_table = Table(mitre_data, colWidths=[160, 360])
    mitre_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(mitre_table)
    elements.append(Spacer(1, 12))

    # 5. Explainable AI Reasoning (SHAP Contribution)
    elements.append(Paragraph("4. Explainable AI (XAI) Attribution Narrative", section_style))
    explanation_text = forecast.get("ai_reasoning") or (
        "Prediction is primarily influenced by abnormal packet rate escalation (+36%), "
        "severe SYN flag disproportion (+28%), and destination IP target concentration (+20%). "
        "Telemetry indicates active synchronization flood characteristic of distributed denial-of-service."
    )
    elements.append(Paragraph(explanation_text, body_style))
    elements.append(Spacer(1, 12))

    # 6. Recommended Response & Analyst Remediation
    elements.append(Paragraph("5. Recommended Tactical Response Actions", section_style))
    action_text = forecast.get("recommended_action") or (
        "1. Activate perimeter rate-limiting rules on external ingress router.\n"
        "2. Reroute HTTP/HTTPS traffic through upstream cloud DDoS mitigation proxy.\n"
        "3. Quarantine offensive source IP prefixes at border firewall ACLs."
    )
    elements.append(Paragraph(action_text, body_style))
    elements.append(Spacer(1, 14))

    # 7. Analyst Sign-off
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceBefore=10, spaceAfter=10))
    sign_off = [
        [Paragraph(f"<b>Prepared By:</b> {report_data.get('generated_by', 'SOC Senior Analyst')}", body_style),
         Paragraph("<b>SOC Lead Approval:</b> ___________________________", body_style)]
    ]
    sign_table = Table(sign_off, colWidths=[260, 260])
    elements.append(sign_table)

    doc.build(elements)
    return filepath
