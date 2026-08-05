import json
import base64

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Hash import SHA256

from pathlib import Path

ROOT = Path(__file__).parent

PRIVATE_KEY_PATH = ROOT / "keys" / "private_key.pem"

with open(PRIVATE_KEY_PATH, "rb") as f:
    PRIVATE_KEY = RSA.import_key(f.read())

print("✅ Private key loaded successfully")


def decrypt_request(body):
    encrypted_flow_data = base64.b64decode(body["encrypted_flow_data"])
    encrypted_aes_key = base64.b64decode(body["encrypted_aes_key"])
    iv = base64.b64decode(body["initial_vector"])

    # RSA decrypt AES key
    cipher_rsa = PKCS1_OAEP.new(
    PRIVATE_KEY,
    hashAlgo=SHA256
)
    aes_key = cipher_rsa.decrypt(encrypted_aes_key)

    # Split ciphertext and authentication tag
    ciphertext = encrypted_flow_data[:-16]
    tag = encrypted_flow_data[-16:]

    cipher = AES.new(aes_key, AES.MODE_GCM, nonce=iv)

    decrypted = cipher.decrypt_and_verify(ciphertext, tag)

    return json.loads(decrypted.decode()), aes_key, iv


def encrypt_response(response, aes_key, iv):
    response_bytes = json.dumps(response).encode()

    # Flip every bit of the IV (Meta requirement)
    response_iv = bytes([b ^ 0xFF for b in iv])

    cipher = AES.new(aes_key, AES.MODE_GCM, nonce=response_iv)

    encrypted_data, tag = cipher.encrypt_and_digest(response_bytes)

    return base64.b64encode(encrypted_data + tag).decode()