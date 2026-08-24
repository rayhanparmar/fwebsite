import os
import requests

WHATSAPP_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
FLOW_ID = os.getenv("WHATSAPP_FLOW_ID")
print("FLOW_ID =", FLOW_ID)


def send_text_message(to, message):

    url = f"https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    print("Text Message Response:")
    print(response.status_code)
    print(response.text)

    return response


def send_flow(to):

    url = f"https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "flow",
            "header": {
                "type": "text",
                "text": "Shree Mother Gold & Diamond Jewellery"
            },
            "body": {
                "text": "Welcome! Please fill out your Jewellery Manufacturing Order Form."
            },
            "footer": {
                "text": "Powered by Shree Mother Gold"
            },
            "action": {
                "name": "flow",
                "parameters": {
                    "flow_message_version": "3",
                    "flow_id": FLOW_ID,
                    "flow_cta": "Start Order"
                }
            }
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    print("Flow Response:")
    print(response.status_code)
    print(response.text)

    return response


# ============================================================
# SEND PDF DOCUMENT
# ============================================================

def send_document(to, document_url, filename, caption=None):

    url = f"https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    document_data = {
        "link": document_url,
        "filename": filename
    }

    if caption:
        document_data["caption"] = caption

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "document",
        "document": document_data
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload
    )

    print("PDF Document Response:")
    print(response.status_code)
    print(response.text)

    return response