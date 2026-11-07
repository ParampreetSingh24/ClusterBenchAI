import io
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class PDFReportGenerator:
    @staticmethod
    def generate_research_pdf(
        dataset_name: str,
        dataset_summary: Dict[str, Any],
        ranked_results: List[Dict[str, Any]],
        insights: Dict[str, Any]
    ) -> bytes:
        """
        Builds a publishable academic research-grade PDF benchmark report.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        
        styles = getSampleStyleSheet()
        
        # Custom Academic Typography Styles
        title_style = ParagraphStyle(
            'AcademicTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A'),
            alignment=1, # Center
            spaceAfter=8
        )
        subtitle_style = ParagraphStyle(
            'AcademicSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#475569'),
            alignment=1,
            spaceAfter=15
        )
        section_style = ParagraphStyle(
            'AcademicSection',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=15,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'AcademicBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12.5,
            textColor=colors.HexColor('#334155'),
            spaceAfter=6
        )
        abstract_style = ParagraphStyle(
            'AcademicAbstract',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#1E293B'),
            leftIndent=15,
            rightIndent=15,
            spaceAfter=10
        )
        table_cell_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#1E293B')
        )
        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.white
        )

        elements = []

        # 1. Header Banner & Title
        elements.append(Paragraph(f"ClusterBenchAI: Comprehensive Clustering Benchmark on {dataset_name}", title_style))
        elements.append(Paragraph("A Multi-Criteria Empirical Evaluation of Nine Machine Learning Clustering Paradigms", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=2, spaceAfter=12))

        # 2. Abstract
        paper_sections = insights.get("paper_sections", {})
        abstract_text = paper_sections.get("abstract", "This report presents an empirical benchmark evaluation.")
        elements.append(Paragraph("<b>ABSTRACT</b>", section_style))
        elements.append(Paragraph(f"<i>{abstract_text}</i>", abstract_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceBefore=4, spaceAfter=10))

        # 3. Dataset Characteristics Table
        elements.append(Paragraph("I. DATASET TOPOLOGY & SPECIFICATIONS", section_style))
        num_rows = dataset_summary.get("num_rows", "N/A")
        num_cols = dataset_summary.get("num_cols", "N/A")
        missing_count = dataset_summary.get("total_missing_cells", 0)
        target = dataset_summary.get("detected_target", "None")

        ds_data = [
            [Paragraph("<b>Attribute</b>", table_header_style), Paragraph("<b>Specification</b>", table_header_style), Paragraph("<b>Attribute</b>", table_header_style), Paragraph("<b>Specification</b>", table_header_style)],
            [Paragraph("Dataset Name", table_cell_style), Paragraph(str(dataset_name), table_cell_style), Paragraph("Total Samples (N)", table_cell_style), Paragraph(str(num_rows), table_cell_style)],
            [Paragraph("Total Features (D)", table_cell_style), Paragraph(str(num_cols), table_cell_style), Paragraph("Missing Values", table_cell_style), Paragraph(str(missing_count), table_cell_style)],
            [Paragraph("Ground Truth Class", table_cell_style), Paragraph(str(target), table_cell_style), Paragraph("Evaluation Engine", table_cell_style), Paragraph("Scikit-Learn / Fast Vectorized", table_cell_style)]
        ]
        t_ds = Table(ds_data, colWidths=[110, 150, 110, 160])
        t_ds.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_ds)
        elements.append(Spacer(1, 10))

        # 4. Comparative Benchmark Results Table
        elements.append(Paragraph("II. EMPIRICAL BENCHMARK EVALUATION & LEADERBOARD", section_style))
        elements.append(Paragraph("Table 1 summarizes all nine algorithms sorted by their multi-criteria composite score across cluster separation (Silhouette), compactness (Davies-Bouldin), dispersion (Calinski-Harabasz), ground-truth alignment (Purity), and CPU execution runtime.", body_style))

        headers = [
            Paragraph("<b>Rank</b>", table_header_style),
            Paragraph("<b>Algorithm</b>", table_header_style),
            Paragraph("<b>Score</b>", table_header_style),
            Paragraph("<b>Silhouette ↑</b>", table_header_style),
            Paragraph("<b>Davies-B ↓</b>", table_header_style),
            Paragraph("<b>Calinski ↑</b>", table_header_style),
            Paragraph("<b>Purity ↑</b>", table_header_style),
            Paragraph("<b>Time (ms)</b>", table_header_style)
        ]
        
        bench_rows = [headers]
        for r in ranked_results:
            m = r.get("metrics", {})
            sil_str = f"{m.get('silhouette_score'):.3f}" if m.get('silhouette_score') is not None else "N/A"
            db_str = f"{m.get('davies_bouldin_index'):.3f}" if m.get('davies_bouldin_index') is not None else "N/A"
            ch_str = f"{m.get('calinski_harabasz_score'):.1f}" if m.get('calinski_harabasz_score') is not None else "N/A"
            pur_str = f"{m.get('purity') * 100:.1f}%" if m.get('purity') is not None else "N/A"
            time_str = f"{m.get('execution_time_ms'):.1f}" if m.get('execution_time_ms') is not None else "N/A"
            score_str = f"{r.get('composite_score'):.1f}"

            row = [
                Paragraph(f"<b>#{r.get('rank')}</b>", table_cell_style),
                Paragraph(str(r.get("algorithm")), table_cell_style),
                Paragraph(f"<b>{score_str}</b>", table_cell_style),
                Paragraph(sil_str, table_cell_style),
                Paragraph(db_str, table_cell_style),
                Paragraph(ch_str, table_cell_style),
                Paragraph(pur_str, table_cell_style),
                Paragraph(time_str, table_cell_style)
            ]
            bench_rows.append(row)

        t_bench = Table(bench_rows, colWidths=[35, 115, 45, 65, 65, 75, 60, 70])
        t_bench.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(t_bench)
        elements.append(Spacer(1, 10))

        # 5. Automated AI Insights & Discussion
        elements.append(Paragraph("III. ACADEMIC DISCUSSION & ANALYSIS", section_style))
        winner_text = insights.get("why_winner", "Algorithm analysis provided.")
        elements.append(Paragraph(f"<b>Winning Model Synthesis:</b> {winner_text}", body_style))
        
        elements.append(Paragraph("<b>Topological Insights:</b>", body_style))
        for note in insights.get("topology_notes", []):
            elements.append(Paragraph(f"• {note}", body_style))

        elements.append(Spacer(1, 6))

        # 6. Computational Complexity Reference Table
        elements.append(Paragraph("IV. COMPUTATIONAL COMPLEXITY TAXONOMY", section_style))
        comp_headers = [
            Paragraph("<b>Algorithm</b>", table_header_style),
            Paragraph("<b>Paradigm</b>", table_header_style),
            Paragraph("<b>Time Complexity</b>", table_header_style),
            Paragraph("<b>Space Complexity</b>", table_header_style),
            Paragraph("<b>Noise Resilience</b>", table_header_style)
        ]
        comp_rows = [comp_headers]
        for row in insights.get("complexity_matrix", [])[:6]: # top 6 for space
            comp_rows.append([
                Paragraph(str(row["algorithm"]), table_cell_style),
                Paragraph(str(row["paradigm"]), table_cell_style),
                Paragraph(str(row["time_complexity"]), table_cell_style),
                Paragraph(str(row["space_complexity"]), table_cell_style),
                Paragraph(str(row["handles_noise"]), table_cell_style)
            ])
        t_comp = Table(comp_rows, colWidths=[95, 125, 110, 100, 100])
        t_comp.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        elements.append(t_comp)
        elements.append(Spacer(1, 10))

        # 7. Conclusion & Project Summary
        elements.append(Paragraph("V. CONCLUSION & SUMMARY", section_style))
        elements.append(Paragraph(paper_sections.get("conclusion", "Benchmark and evaluation concluded."), body_style))
        elements.append(Spacer(1, 4))
        
        project_summary = (
            f"<b>Project:</b> ClusterBenchAI | <b>Dataset:</b> {dataset_name}<br/>"
            "Comprehensive comparative evaluation of 9 clustering algorithms across partitional, "
            "density, hierarchical, spectral, and probabilistic paradigms."
        )
        elements.append(Paragraph(project_summary, body_style))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
