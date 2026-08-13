import json

from fastapi import APIRouter, Form, HTTPException

from app.pdf.generator import generate_pdf


router = APIRouter()


@router.post("/generate_pdf")
async def create_pdf(
    member_name: str = Form(...),
    plan_name: str = Form(...),
    member_id: str = Form("000000"),
    start_date: str = Form("2026-01-01"),
    template_name: str = Form("sample_anoc.html"),
    year: str = Form("2026"),
    contact_number: str = Form("1-800-555-0000"),
    website: str = Form("www.example.com"),
    changes_json: str = Form("[]"),
):
    try:
        changes = json.loads(changes_json)

        if not isinstance(changes, list):
            raise ValueError()

    except (json.JSONDecodeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="changes_json must contain a valid JSON array"
        )

    result = generate_pdf(
        member_name=member_name,
        plan_name=plan_name,
        member_id=member_id,
        start_date=start_date,
        template_name=template_name,
        year=year,
        changes=changes,
        contact_number=contact_number,
        website=website,
    )

    return {
        "pdf_path": result["path"],
        "pdf_url": result["url"],
        "filename": result["filename"]
    }
