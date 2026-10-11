from pathlib import Path
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
REPORT_DIR = BASE_DIR / "reports"

REPORT_DIR.mkdir(exist_ok=True)


def load_csv(filename):
    import pandas as pd

    path = DATA_DIR / filename

    if not path.exists():
        return pd.DataFrame()

    return pd.read_csv(path)


def generate_water_network_report():
    """
    Generate a PDF report containing:
    - Network summary
    - Anomaly summary
    - Leak detection summary
    - Water balance
    - Maintenance priorities
    - Human approval status
    """

    anomalies = load_csv("anomaly_results.csv")
    leaks = load_csv("leak_detection_results.csv")
    water_balance = load_csv("water_balance_results.csv")
    maintenance = load_csv("maintenance_plan.csv")

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    report_path = (
        REPORT_DIR
        / f"water_network_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )

    doc = SimpleDocTemplate(
        str(report_path),
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        spaceAfter=12,
    )

    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        fontSize=14,
        spaceBefore=12,
        spaceAfter=8,
    )

    normal_style = ParagraphStyle(
        "ReportNormal",
        parent=styles["BodyText"],
        fontSize=9,
        leading=13,
    )

    story = []

    # ---------------------------------------------------------
    # TITLE
    # ---------------------------------------------------------

    story.append(
        Paragraph(
            "Agentic AI Water Distribution<br/>"
            "Leak Detection & Resource Optimization System",
            title_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Generated:</b> {timestamp}",
            normal_style,
        )
    )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "Water Network Decision-Support Report",
            heading_style,
        )
    )

    story.append(
        Paragraph(
            "This report summarizes sensor monitoring, anomaly detection, "
            "leak assessment, water-loss analysis, maintenance prioritization, "
            "and operational recommendations.",
            normal_style,
        )
    )

    # ---------------------------------------------------------
    # NETWORK SUMMARY
    # ---------------------------------------------------------

    story.append(
        Paragraph("1. Network Monitoring Summary", heading_style)
    )

    total_anomalies = len(anomalies)

    if not anomalies.empty and "dma_id" in anomalies.columns:
        dma_count = anomalies["dma_id"].nunique()
    else:
        dma_count = 0

    summary_data = [
        ["Metric", "Value"],
        ["Anomalous sensor records", str(total_anomalies)],
        ["Distribution zones with anomalies", str(dma_count)],
        ["Human approval", "Required"],
        ["Physical infrastructure control", "Not automatic"],
    ]

    table = Table(summary_data, colWidths=[260, 220])

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )

    story.append(table)

    # ---------------------------------------------------------
    # ANOMALIES
    # ---------------------------------------------------------

    story.append(
        Paragraph("2. Flow & Pressure Anomaly Analysis", heading_style)
    )

    if not anomalies.empty:

        anomaly_columns = [
            "timestamp",
            "dma_id",
            "flow_z_score",
            "pressure_z_score",
            "nighttime_flow_anomaly",
        ]

        available = [
            col for col in anomaly_columns
            if col in anomalies.columns
        ]

        rows = [["Timestamp", "DMA", "Flow Z", "Pressure Z", "Nighttime"]]

        for _, row in anomalies.head(15).iterrows():

            rows.append(
                [
                    str(row.get("timestamp", "-")),
                    str(row.get("dma_id", "-")),
                    f"{float(row.get('flow_z_score', 0)):.2f}",
                    f"{float(row.get('pressure_z_score', 0)):.2f}",
                    str(row.get("nighttime_flow_anomaly", False)),
                ]
            )

        table = Table(
            rows,
            colWidths=[105, 55, 65, 70, 75],
            repeatRows=1,
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]
            )
        )

        story.append(table)

    else:
        story.append(
            Paragraph("No anomaly records available.", normal_style)
        )

    # ---------------------------------------------------------
    # LEAK DETECTION
    # ---------------------------------------------------------

    story.append(
        Paragraph("3. Leak Detection & Localization", heading_style)
    )

    if not leaks.empty:

        high_confidence = 0

        if "confidence" in leaks.columns:
            high_confidence = int(
                (leaks["confidence"] == "High").sum()
            )

        story.append(
            Paragraph(
                f"<b>Total leak assessments:</b> {len(leaks)}<br/>"
                f"<b>High-confidence assessments:</b> {high_confidence}<br/>"
                "<b>Localization approach:</b> Suspected DMA / pipe section "
                "based on available topology and sensor evidence.<br/>"
                "<b>Exact underground location:</b> Not claimed.",
                normal_style,
            )
        )

        if "dma_id" in leaks.columns:

            rows = [
                [
                    "DMA",
                    "Pipe",
                    "Score",
                    "Confidence",
                    "Status",
                ]
            ]

            for _, row in leaks.head(15).iterrows():

                rows.append(
                    [
                        str(row.get("dma_id", "-")),
                        str(row.get("pipe_section", "-")),
                        f"{float(row.get('leak_score', 0)):.2f}",
                        str(row.get("confidence", "-")),
                        str(row.get("status", "-")),
                    ]
                )

            table = Table(
                rows,
                colWidths=[60, 80, 60, 75, 150],
                repeatRows=1,
            )

            table.setStyle(
                TableStyle(
                    [
                        (
                            "BACKGROUND",
                            (0, 0),
                            (-1, 0),
                            colors.HexColor("#17324D"),
                        ),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                        ("FONTSIZE", (0, 0), (-1, -1), 7),
                        (
                            "FONTNAME",
                            (0, 0),
                            (-1, 0),
                            "Helvetica-Bold",
                        ),
                    ]
                )
            )

            story.append(Spacer(1, 8))
            story.append(table)

    # ---------------------------------------------------------
    # WATER BALANCE
    # ---------------------------------------------------------

    story.append(
        Paragraph("4. Water Balance & Loss Analysis", heading_style)
    )

    if not water_balance.empty:

        columns = [
            "dma_id",
            "total_water_supplied_m3",
            "total_metered_consumption_m3",
            "unexplained_water_m3",
            "water_loss_percentage",
            "high_confidence_leak_events",
        ]

        rows = [
            [
                "DMA",
                "Supplied",
                "Consumption",
                "Unexplained",
                "Loss %",
                "High Conf.",
            ]
        ]

        for _, row in water_balance.iterrows():

            rows.append(
                [
                    str(row.get("dma_id", "-")),
                    f"{float(row.get('total_water_supplied_m3', 0)):,.0f}",
                    f"{float(row.get('total_metered_consumption_m3', 0)):,.0f}",
                    f"{float(row.get('unexplained_water_m3', 0)):,.0f}",
                    f"{float(row.get('water_loss_percentage', 0)):.2f}%",
                    str(row.get("high_confidence_leak_events", 0)),
                ]
            )

        table = Table(
            rows,
            colWidths=[50, 85, 85, 80, 55, 65],
            repeatRows=1,
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]
            )
        )

        story.append(table)

        story.append(Spacer(1, 8))

        story.append(
            Paragraph(
                "<b>Important:</b> Unexplained water does not automatically "
                "represent confirmed leakage. It may also include measurement "
                "issues, authorized/unmetered consumption, or other network "
                "conditions.",
                normal_style,
            )
        )

    # ---------------------------------------------------------
    # MAINTENANCE
    # ---------------------------------------------------------

    story.append(
        Paragraph("5. Maintenance & Field Resource Planning", heading_style)
    )

    if not maintenance.empty:

        rows = [
            [
                "DMA",
                "Pipe",
                "Priority",
                "Score",
                "Team",
                "Approval",
            ]
        ]

        for _, row in maintenance.iterrows():

            rows.append(
                [
                    str(row.get("dma_id", "-")),
                    str(row.get("pipe_section", "-")),
                    str(row.get("priority", "-")),
                    f"{float(row.get('priority_score', 0)):.2f}",
                    str(row.get("assigned_team", "-")),
                    str(row.get("status", "-")),
                ]
            )

        table = Table(
            rows,
            colWidths=[45, 65, 95, 45, 70, 110],
            repeatRows=1,
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ]
            )
        )

        story.append(table)

    # ---------------------------------------------------------
    # HUMAN APPROVAL
    # ---------------------------------------------------------

    story.append(
        Paragraph("6. Human-in-the-Loop Operations", heading_style)
    )

    story.append(
        Paragraph(
            "<b>Approval status:</b> Pending Human Approval<br/>"
            "<b>Execution mode:</b> Manual / operator-controlled<br/>"
            "<b>Safety:</b> The prototype does not autonomously operate "
            "pumps, valves, or other physical infrastructure.<br/><br/>"
            "Recommended field actions should be reviewed by authorized "
            "water-utility personnel before execution.",
            normal_style,
        )
    )

    # ---------------------------------------------------------
    # CONCLUSION
    # ---------------------------------------------------------

    story.append(
        Paragraph("7. Operational Summary", heading_style)
    )

    story.append(
        Paragraph(
            "The system combines sensor monitoring, demand forecasting, "
            "flow and pressure anomaly detection, leak assessment, water "
            "balance analysis, maintenance prioritization, and operational "
            "recommendations into a human-approved decision-support workflow.",
            normal_style,
        )
    )

    doc.build(story)

    return report_path