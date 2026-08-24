import os
import tempfile
import requests

from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
)


# ============================================================
# SETTINGS
# ============================================================

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# We will use your existing jewellery logo.
LOGO_PATH = os.path.join(
    BACKEND_DIR,
    "..",
    "frontend",
    "public",
    "shreemothergold_logo.png"
)


# ============================================================
# DOWNLOAD IMAGE
# ============================================================

def download_image(url):
    """
    Download an image from a URL and return its local path.
    """

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    suffix = ".jpg"

    content_type = response.headers.get("Content-Type", "")

    if "png" in content_type:
        suffix = ".png"
    elif "webp" in content_type:
        suffix = ".webp"
    elif "jpeg" in content_type or "jpg" in content_type:
        suffix = ".jpg"

    temp = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    )

    temp.write(response.content)
    temp.close()

    return temp.name


# ============================================================
# CREATE PDF
# ============================================================

def create_order_pdf(order):
    """
    Create a PDF containing the complete jewellery order.

    The PDF includes:
    - Order ID
    - Customer/form information
    - Uploaded design images

    The PDF DOES NOT include the reference video.
    """

    order_id = order.get("orderId", "UNKNOWN")

    filename = f"{order_id}.pdf"

    output_dir = os.path.join(
        BACKEND_DIR,
        "generated_pdfs"
    )

    os.makedirs(output_dir, exist_ok=True)

    pdf_path = os.path.join(
        output_dir,
        filename
    )

    # --------------------------------------------------------
    # PDF DOCUMENT
    # --------------------------------------------------------

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=18,
        leading=22,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=10,
        leading=14,
        spaceAfter=15
    )

    heading_style = ParagraphStyle(
        "HeadingStyle",
        parent=styles["Heading2"],
        fontSize=12,
        leading=15,
        spaceBefore=10,
        spaceAfter=6
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=13
    )

    story = []

    # ========================================================
    # LOGO
    # ========================================================

    if os.path.exists(LOGO_PATH):

        try:
            logo = Image(
                LOGO_PATH,
                width=45 * mm,
                height=25 * mm,
                kind="proportional"
            )

            logo.hAlign = "CENTER"

            story.append(logo)
            story.append(Spacer(1, 5 * mm))

        except Exception as e:
            print("Logo could not be added:", e)

    # ========================================================
    # TITLE
    # ========================================================

    story.append(
        Paragraph(
            "JEWELLERY MANUFACTURING ORDER",
            title_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Order ID:</b> {order_id}",
            subtitle_style
        )
    )

    # ========================================================
    # ORDER INFORMATION
    # ========================================================

    story.append(
        Paragraph(
            "Order Information",
            heading_style
        )
    )

    order_info = []

    for key, value in order.items():

        # These are internal / unwanted fields.
        if key in {
            "_id",
            "flow_token",
            "reference_video"
        }:
            continue

        # Images are handled separately below.
        if key == "design_images":
            continue

        if value is None:
            value = ""

        if isinstance(value, list):
            value = ", ".join(
                str(item) for item in value
            )

        if hasattr(value, "strftime"):
            value = value.strftime(
                "%d %B %Y, %I:%M %p"
            )

        label = (
            str(key)
            .replace("_", " ")
            .title()
        )

        order_info.append(
            [
                Paragraph(
                    f"<b>{label}</b>",
                    normal_style
                ),
                Paragraph(
                    str(value),
                    normal_style
                )
            ]
        )

    if order_info:

        table = Table(
            order_info,
            colWidths=[
                55 * mm,
                115 * mm
            ],
            repeatRows=0
        )

        table.setStyle(
            TableStyle([
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.whitesmoke
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                ),
            ])
        )

        story.append(table)

    # ========================================================
    # DESIGN IMAGES
    # ========================================================

    design_images = order.get(
        "design_images",
        []
    )

    if isinstance(design_images, str):
        design_images = [design_images]

    if design_images:

        story.append(
            Paragraph(
                "Customer Uploaded Design Images",
                heading_style
            )
        )

        temporary_files = []

        for image_url in design_images:

            try:

                local_image = download_image(
                    image_url
                )

                temporary_files.append(
                    local_image
                )

                image = Image(
                    local_image,
                    width=80 * mm,
                    height=80 * mm,
                    kind="proportional"
                )

                image.hAlign = "CENTER"

                story.append(image)
                story.append(
                    Spacer(1, 8 * mm)
                )

            except Exception as e:

                print(
                    "Could not add image to PDF:",
                    e
                )

        # ====================================================
        # BUILD PDF
        # ====================================================

        doc.build(story)

        # Clean temporary downloaded images.
        for temp_file in temporary_files:

            try:
                os.remove(temp_file)

            except Exception:
                pass

    else:

        # Build even when there are no images.
        doc.build(story)

    print(
        f"PDF created successfully: {pdf_path}"
    )

    return pdf_path