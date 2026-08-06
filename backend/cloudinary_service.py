import os
import tempfile
import requests
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

print("Cloud Name =", os.getenv("CLOUDINARY_CLOUD_NAME"))
print("API Key =", os.getenv("CLOUDINARY_API_KEY"))
print("API Secret =", os.getenv("CLOUDINARY_API_SECRET"))


def get_media_url(media_id):

    url = f"https://graph.facebook.com/v26.0/{media_id}"

    response = requests.get(
        url,
        headers={
            "Authorization": f"Bearer {os.getenv('WHATSAPP_ACCESS_TOKEN')}"
        }
    )

    response.raise_for_status()

    return response.json()["url"]


def upload_whatsapp_image(media_id):

    print("========== CLOUDINARY IMAGE ==========")
    print("Media ID:", media_id)

    media_url = get_media_url(media_id)

    print("Media URL received")

    response = requests.get(
        media_url,
        headers={
            "Authorization": f"Bearer {os.getenv('WHATSAPP_ACCESS_TOKEN')}"
        }
    )

    print("Downloaded from Meta:", response.status_code)

    response.raise_for_status()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        temp.write(response.content)
        temp_path = temp.name

    print("Temporary file:", temp_path)

    result = cloudinary.uploader.upload(
        temp_path,
        folder="orders/images"
    )

    print("Cloudinary Upload Success")
    print(result)

    os.remove(temp_path)

    print("======================================")

    return result