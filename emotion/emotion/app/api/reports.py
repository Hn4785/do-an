from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import csv
import json

router = APIRouter(prefix="/sessions", tags=["Reports"])

# ─── In-memory report store (thay bằng DB thực tế sau) ──────────────────────
_reports: dict[str, dict] = {}


def _get_report_or_404(session_id: str) -> dict:
    report = _reports.get(session_id)
    if not report:
        raise HTTPException(
            status_code=404,
            detail=f"Báo cáo cho session '{session_id}' chưa có hoặc phiên chưa kết thúc",
        )
    return report


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/{session_id}/report", summary="Báo cáo chi tiết phiên")
async def get_session_report(session_id: str):
    """
    GET /sessions/:id/report — Trả về báo cáo đầy đủ của phiên.
    """
    report = _get_report_or_404(session_id)
    return {
        "success": True,
        "data":    report,
    }


@router.get("/{session_id}/report/export", summary="Xuất báo cáo")
async def export_session_report(
    session_id: str,
    format: str = Query(default="json", pattern="^(json|csv)$"),
):
    """
    GET /sessions/:id/report/export?format=json|csv
    Xuất báo cáo dưới dạng file tải về.
    """
    report = _get_report_or_404(session_id)

    if format == "json":
        content = json.dumps(report, ensure_ascii=False, indent=2, default=str)
        return StreamingResponse(
            io.BytesIO(content.encode("utf-8")),
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="report_{session_id}.json"'
            },
        )

    # CSV export
    output = io.StringIO()
    writer = csv.writer(output)

    # Header + overview
    overview = report.get("overview", {})
    writer.writerow(["Field", "Value"])
    for k, v in overview.items():
        writer.writerow([k, v])

    # Timeline
    timeline = report.get("timeline", [])
    if timeline:
        writer.writerow([])
        writer.writerow(["--- Timeline ---"])
        writer.writerow(timeline[0].keys())
        for point in timeline:
            writer.writerow(point.values())

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),  # utf-8-sig cho Excel
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="report_{session_id}.csv"'
        },
    )


# ─── Internal helper ─────────────────────────────────────────────────────────

def save_report_internal(session_id: str, report: dict) -> None:
    """Lưu báo cáo sau khi phiên kết thúc — gọi từ WebSocket handler"""
    _reports[session_id] = report
