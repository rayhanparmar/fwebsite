import os
import tempfile
import requests

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
)


# ============================================================
# SETTINGS
# ============================================================

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

LOGO_PATH = os.path.join(
    BACKEND_DIR,
    "..",
    "frontend",
    "public",
    "shreemothergold_logo.png"
)


# ============================================================
# WHATSAPP FLOW FIELD ORDER + CUSTOMER-FACING LABELS
# ============================================================
#
# IMPORTANT:
# This order follows the WhatsApp Flow exactly.
#
# Only fields which actually contain a value are shown.
#
# Internal database names are NOT shown to the customer.
# ============================================================

FLOW_FIELDS = [
    ("order_type", "Order Type"),
    ("customer_name", "Customer Name"),
    ("metal", "Metal"),
    ("gold_kt", "Gold Purity (KT)"),
    ("gold_colour", "Gold Colour"),
    ("gold_colour_other", "Specify Gold Colour"),
    ("platinum_purity", "Platinum Purity"),
    ("metal_colour_platinum", "Metal Colour"),
    ("metal_purity_combo", "Metal Purity"),
    ("metal_colour_combo", "Metal Colour"),
    ("metal_colour_combo_other", "Specify Metal Colour"),
    ("order_date", "Order Date"),
    ("party_reference_order_id", "Party Reference Order ID"),
    ("product_category", "Category"),

    ("bali_size", "Bali Size"),
    ("bangle_kada_size1", "Size 1"),
    ("bangle_kada_size2", "Size 2"),
    ("bracelet_size", "Bracelet Size"),

    ("need_multilayer", "Need Multilayer Chain?"),
    ("multilayer_chain_size", "Multilayer Chain Size"),
    ("chain_size", "Chain Size"),

    ("cufflink_size", "Cufflink Size"),
    ("brooch_size", "Brooch Size"),
    ("earring_size", "Earring Size"),
    ("haathpaan_size", "Haathpaan Size"),
    ("maang_tikka_size", "Maang Tikka Size"),
    ("mangalsutra_size", "Mangal Sutra Size"),
    ("necklace_size", "Necklace Size"),
    ("nose_pin_size", "Nose Pin Size"),

    ("pendant_chain_size", "Chain Size"),
    ("pendant_size_optional", "Pendant Size"),

    ("ring_size", "Ring Size"),
    ("tops_size", "Tops Size"),
    ("watch_belt_size", "Watch Belt Size"),

    ("full_set_choice_1", "Do you need?"),
    ("full_set_choice_2", "Do you need?"),
    ("full_set_chain_size", "Chain Size"),
    ("full_set_necklace_size", "Necklace Size"),
    ("full_set_tops_size", "Tops Size"),
    ("full_set_earring_size", "Earring Size"),

    ("approx_weight", "Weight (g)"),
    ("stone_type", "Stone Type"),
    ("stone_type_other", "Specify Stone Type"),
    ("finish_type", "Finish Type"),
    ("finish_type_other", "Specify Finish Type"),
    ("hallmark_required", "Hallmark Required"),
    ("need_call", "Call Required?"),
    ("due_date", "Due Date"),
    ("remarks", "Remarks"),
    ("reference_link", "Reference Image/Video Link"),
]


# ============================================================
# WHATSAPP FLOW OPTION LABELS
# ============================================================
#
# These convert the internal values stored in MongoDB into
# exactly what the customer saw in the WhatsApp Flow.
# ============================================================

OPTION_LABELS = {

    # --------------------------------------------------------
    # ORDER TYPE
    # --------------------------------------------------------

    "catalogue": "Catalogue Order",
    "custom": "Custom Jewellery Order",

    # --------------------------------------------------------
    # METAL
    # --------------------------------------------------------

    "gold": "Gold",
    "platinum": "Platinum",
    "gold_platinum": "Gold + Platinum",

    # --------------------------------------------------------
    # GOLD PURITY
    # --------------------------------------------------------

    "9kt": "9KT",
    "14kt": "14KT",
    "18kt": "18KT",
    "22kt": "22KT",

    # --------------------------------------------------------
    # GOLD / METAL COLOUR
    # --------------------------------------------------------

    "yellow": "Yellow",
    "white": "White",
    "rose": "Rose",
    "yellow_white": "Yellow + White",
    "rose_white": "Rose + White",
    "rose_yellow": "Rose + Yellow",
    "rose_white_yellow": "Rose + White + Yellow",
    "green": "Green",
    "green_white": "Green + White",
    "green_yellow": "Green + Yellow",
    "green_rose": "Green + Rose",

    # --------------------------------------------------------
    # OTHER
    # --------------------------------------------------------

    "other": "Other",

    # --------------------------------------------------------
    # PLATINUM
    # --------------------------------------------------------

    "95_platinum": "95 Platinum",

    # --------------------------------------------------------
    # GOLD + PLATINUM PURITY
    # --------------------------------------------------------

    "95p_9kt": "95(P) + 9KT",
    "95p_14kt": "95(P) + 14KT",
    "95p_18kt": "95(P) + 18KT",

    # --------------------------------------------------------
    # PRODUCT CATEGORY
    # --------------------------------------------------------

    "bali": "Bali",
    "bangle_kada": "Bangle/Kada",
    "bracelet": "Bracelet",
    "chain_multilayer": "Chain + Multilayer",
    "cufflink": "Cufflink",
    "brooch": "Brooch",
    "earring": "Earring",
    "haathpaan": "Haathpaan",
    "maang_tikka": "Maang Tikka",
    "mangalsutra": "Mangal Sutra",
    "necklace": "Necklace",
    "nose_pin": "Nose Pin",
    "pendant_dancing_stone": "Pendant + Dancing Stone",
    "ring_titanium": "Ring + Titanium Ring",
    "tops": "Tops",
    "watch_belt": "Watch Belt",
    "full_set": "Full Set",

    # --------------------------------------------------------
    # YES / NO
    # --------------------------------------------------------

    "yes": "Yes",
    "no": "No",

    # --------------------------------------------------------
    # STONE TYPE
    # --------------------------------------------------------

    "natural_diamond": "Natural Diamond",
    "lab_grown_diamond": "Lab Grown Diamond",
    "cz": "CZ",
    "colour_stone": "Colour Stone",
    "precious_stone": "Precious Stone",

    # --------------------------------------------------------
    # FINISH TYPE
    # --------------------------------------------------------

    "high_polish": "High Polish",
    "matt": "Matt",
    "sandblast": "Sandblast",
    "matt_high_polish": "Matt + High Polish",

    # --------------------------------------------------------
    # FULL SET
    # --------------------------------------------------------

    "chain": "Chain",
    "tops": "Tops",
    "earring": "Earring",
    "necklace": "Necklace",
}


# ============================================================
# DISPLAY VALUE
# ============================================================

def display_value(field_name, value):
    """
    Convert the internal MongoDB value into the exact
    customer-facing value used by the WhatsApp Flow.
    """

    if value is None:
        return ""

    value = str(value).strip()

    if not value:
        return ""

    # --------------------------------------------------------
    # DIRECT FLOW OPTION
    # --------------------------------------------------------

    if value in OPTION_LABELS:
        return OPTION_LABELS[value]

    # --------------------------------------------------------
    # BANGLE / KADA SIZE
    #
    # anna_2       -> 2 Anna
    # anna_2_7     -> 2/7 Anna
    # --------------------------------------------------------

    if field_name in {
        "bangle_kada_size1",
        "bangle_kada_size2"
    }:

        if value.startswith("anna_"):

            size = value.replace("anna_", "")

            if "_" in size:
                parts = size.split("_")

                if len(parts) == 2:
                    size = f"{parts[0]}/{parts[1]}"

            return f"{size} Anna"

    # --------------------------------------------------------
    # BRACELET SIZE
    #
    # br_6_00 -> 6.00 inch
    # --------------------------------------------------------

    if field_name == "bracelet_size":

        if value.startswith("br_"):

            size = value.replace("br_", "").replace("_", ".")

            return f"{size} inch"

    # --------------------------------------------------------
    # CHAIN SIZE
    #
    # ch_16 -> 16 inch
    # --------------------------------------------------------

    if field_name in {
        "chain_size",
        "mangalsutra_size",
        "necklace_size",
        "pendant_chain_size",
        "full_set_chain_size",
        "full_set_necklace_size",
    }:

        prefixes = [
            "ch_",
            "ms_",
            "nk_",
            "pdch_",
            "fsch_",
            "fsnk_",
        ]

        for prefix in prefixes:

            if value.startswith(prefix):

                size = value.replace(prefix, "")

                return f"{size} inch"

    # --------------------------------------------------------
    # WATCH BELT SIZE
    #
    # wb_6_00 -> 6.00 inch
    # --------------------------------------------------------

    if field_name == "watch_belt_size":

        if value.startswith("wb_"):

            size = value.replace("wb_", "").replace("_", ".")

            return f"{size} inch"

    # --------------------------------------------------------
    # RING SIZE
    #
    # r1 -> 1
    # r30 -> 30
    # --------------------------------------------------------

    if field_name == "ring_size":

        if value.startswith("r") and value[1:].isdigit():

            return value[1:]

    # --------------------------------------------------------
    # MULTILAYER CHAIN
    # --------------------------------------------------------

    if field_name == "multilayer_chain_size":

        multilayer_labels = {
            "ml_1": "14 - 15.5 - 17 inch",
            "ml_2": "14.5 - 16 - 17.5 inch",
            "ml_3": "14 - 15.5 inch",
            "ml_4": "14.5 - 16 inch",
        }

        if value in multilayer_labels:
            return multilayer_labels[value]

    # --------------------------------------------------------
    # NORMAL TEXT / NUMBERS
    # --------------------------------------------------------

    return value


# ============================================================
# DOWNLOAD IMAGE
# ============================================================

def download_image(url):
    """
    Download an image from a URL and return its local path.
    """

    response = requests.get(
        url,
        timeout=30
    )

    response.raise_for_status()

    suffix = ".jpg"

    content_type = response.headers.get(
        "Content-Type",
        ""
    )

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
    Create a customer-friendly PDF matching the WhatsApp Flow.

    Includes:
    - Flow fields in Flow order
    - Customer-facing option labels
    - Customer uploaded images

    Does NOT include:
    - Reference video
    - Priority
    - Assigned To
    - Admin Notes
    - Internal MongoDB fields
    """

    order_id = order.get(
        "orderId",
        "UNKNOWN"
    )

    filename = f"{order_id}.pdf"

    output_dir = os.path.join(
        BACKEND_DIR,
        "generated_pdfs"
    )

    os.makedirs(
        output_dir,
        exist_ok=True
    )

    pdf_path = os.path.join(
        output_dir,
        filename
    )

    # ========================================================
    # PDF DOCUMENT
    # ========================================================

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,

        rightMargin=15 * mm,
        leftMargin=15 * mm,

        topMargin=12 * mm,
        bottomMargin=15 * mm
    )

    styles = getSampleStyleSheet()

    # ========================================================
    # STYLES
    # ========================================================

    title_style = ParagraphStyle(
        "TitleStyle",

        parent=styles["Title"],

        alignment=TA_CENTER,

        fontSize=16,
        leading=19,

        spaceAfter=5
    )

    subtitle_style = ParagraphStyle(
        "SubtitleStyle",

        parent=styles["Normal"],

        alignment=TA_CENTER,

        fontSize=10,
        leading=13,

        spaceAfter=10
    )

    heading_style = ParagraphStyle(
        "HeadingStyle",

        parent=styles["Heading2"],

        fontSize=12,
        leading=15,

        spaceBefore=8,
        spaceAfter=6
    )

    label_style = ParagraphStyle(
        "LabelStyle",

        parent=styles["Normal"],

        fontSize=8.5,
        leading=11,

        spaceAfter=0
    )

    value_style = ParagraphStyle(
        "ValueStyle",

        parent=styles["Normal"],

        fontSize=8.5,
        leading=11,

        spaceAfter=0
    )

    image_heading_style = ParagraphStyle(
        "ImageHeadingStyle",

        parent=styles["Heading2"],

        fontSize=12,
        leading=15,

        spaceBefore=12,
        spaceAfter=8
    )

    story = []

    # ========================================================
    # LOGO
    # ========================================================

    if os.path.exists(LOGO_PATH):

        try:

            logo = Image(
                LOGO_PATH,
                width=38 * mm,
                height=21 * mm,
                kind="proportional"
            )

            logo.hAlign = "CENTER"

            story.append(logo)

            story.append(
                Spacer(1, 2 * mm)
            )

        except Exception as e:

            print(
                "Logo could not be added:",
                e
            )

    # ========================================================
    # TITLE
    # ========================================================

    story.append(
        Paragraph(
            "Rooh By Shree Mother Gold and Diamond Jewellery",
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

    # ========================================================
    # BUILD TABLE IN EXACT FLOW ORDER
    # ========================================================

    for field_name, label in FLOW_FIELDS:

        if field_name not in order:
            continue

        raw_value = order.get(
            field_name
        )

        if raw_value is None:
            continue

        # Convert lists into readable text.
        if isinstance(raw_value, list):

            raw_value = ", ".join(
                str(item)
                for item in raw_value
            )

        # Ignore empty fields.
        if str(raw_value).strip() == "":
            continue

        value = display_value(
            field_name,
            raw_value
        )

        if not value:
            continue

        order_info.append(
            [
                Paragraph(
                    f"<b>{label}</b>",
                    label_style
                ),

                Paragraph(
                    str(value),
                    value_style
                )
            ]
        )

    # ========================================================
    # ORDER TABLE
    # ========================================================

    if order_info:

        table = Table(
            order_info,

            colWidths=[
                55 * mm,
                115 * mm
            ],

            repeatRows=0,

            hAlign="CENTER"
        )

        table.setStyle(
            TableStyle([

                # Border
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                # Alignment
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),

                # Label background
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.whitesmoke
                ),

                # Padding
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
    # CUSTOMER UPLOADED DESIGN IMAGES
    # ========================================================

    design_images = order.get(
        "design_images",
        []
    )

    if isinstance(
        design_images,
        str
    ):

        design_images = [
            design_images
        ]

    if design_images:

        story.append(
            Paragraph(
                "Customer Uploaded Design Images",
                image_heading_style
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

                # ------------------------------------------------
                # Increased image size
                # ------------------------------------------------

                image = Image(
                    local_image,

                    width=90 * mm,
                    height=90 * mm,

                    kind="proportional"
                )

                image.hAlign = "CENTER"

                story.append(image)

                story.append(
                    Spacer(
                        1,
                        7 * mm
                    )
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

        # ====================================================
        # CLEAN TEMPORARY FILES
        # ====================================================

        for temp_file in temporary_files:

            try:

                os.remove(
                    temp_file
                )

            except Exception:
                pass

    else:

        # Build PDF even without images.
        doc.build(story)

    print(
        f"PDF created successfully: {pdf_path}"
    )

    return pdf_path