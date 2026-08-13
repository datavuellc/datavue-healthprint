import os
import re

from jinja2 import Environment, FileSystemLoader, StrictUndefined
from weasyprint import HTML


TEMPLATE_DIRECTORY = "app/templates/clients"


def safe_filename(value: str) -> str:
    value = value.strip()
    value = re.sub(r"[^A-Za-z0-9._-]+", "_", value)
    return value or "document"


def generate_pdf(
    member_name,
    plan_name,
    member_id="000000",
    start_date="2026-01-01",
    template_name="sample_anoc.html",
    year="2026",
    changes=None,
    contact_number="1-800-555-0000",
    website="www.example.com",
):
    if changes is None:
        changes = []

    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIRECTORY),
        undefined=StrictUndefined,
        autoescape=True,
    )

    template = env.get_template(template_name)

    html_output = template.render(
        member_name=member_name,
        plan_name=plan_name,
        member_id=member_id,
        start_date=start_date,
        year=year,
        changes=changes,
        contact_number=contact_number,
        website=website,
    )

    os.makedirs("output", exist_ok=True)

    filename = f"output_{safe_filename(member_name)}.pdf"
    pdf_path = os.path.join("output", filename)

    HTML(
        string=html_output,
        base_url=os.getcwd()
    ).write_pdf(pdf_path)

    return {
        "path": pdf_path,
        "filename": filename,
        "url": f"/pdfs/{filename}"
    }
