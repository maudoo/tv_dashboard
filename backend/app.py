from flask import Flask, jsonify, request
from flask_cors import CORS
import dropbox
import json
import os
import re
import hmac
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

IQAMAH_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jummah Khutbah", "Jummah Iqamah"]
IQAMAHS_FILE = "./data/iqamahs.json"
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")

_REQUIRED_ENV = ["DROPBOX_APP_KEY", "DROPBOX_APP_SECRET", "DROPBOX_REFRESH_TOKEN", "DROPBOX_IMAGES_PATH"]


def _check_env():
    missing = [k for k in _REQUIRED_ENV if not os.environ.get(k)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")
    if not os.environ.get("ADMIN_PASSWORD"):
        print("WARNING: ADMIN_PASSWORD is not set — the admin page cannot save times.")


def load_iqamahs():
    try:
        with open(IQAMAHS_FILE) as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}
    return {key: (data.get(key) or "") for key in IQAMAH_KEYS}


def is_admin(req):
    expected = os.environ.get("ADMIN_PASSWORD", "")
    provided = req.headers.get("X-Admin-Password", "")
    return bool(expected) and hmac.compare_digest(provided, expected)


def get_dropbox():
    return dropbox.Dropbox(
        oauth2_refresh_token=os.environ["DROPBOX_REFRESH_TOKEN"],
        app_key=os.environ["DROPBOX_APP_KEY"],
        app_secret=os.environ["DROPBOX_APP_SECRET"],
    )


@app.route('/LoadImages')
def LoadImages():
    dbx = get_dropbox()
    links = []
    entries = dbx.files_list_folder(os.environ["DROPBOX_IMAGES_PATH"]).entries
    for entry in entries:
        if isinstance(entry, dropbox.files.FileMetadata):
            try:
                shared_links = dbx.sharing_list_shared_links(path=entry.path_lower).links
                if shared_links:
                    link = shared_links[0].url.replace("dl=0", "raw=1")
                else:
                    shared_link_metadata = dbx.sharing_create_shared_link_with_settings(entry.path_lower)
                    link = shared_link_metadata.url.replace("dl=0", "raw=1")
                links.append(link)
            except dropbox.exceptions.ApiError as api_err:
                print(f"LoadImages: error for {entry.path_lower}: {api_err}")
    return links


@app.route('/Iqamahs')
def get_iqamahs():
    return jsonify(load_iqamahs())


@app.route('/Iqamahs', methods=['POST'])
def save_iqamahs():
    if not is_admin(request):
        return jsonify({"error": "unauthorized"}), 401

    body = request.get_json(silent=True) or {}
    cleaned = {}
    for key in IQAMAH_KEYS:
        value = (body.get(key) or "").strip()
        if value and not TIME_RE.match(value):
            return jsonify({"error": f"{key} must be HH:MM (24-hour) or empty"}), 400
        cleaned[key] = value

    os.makedirs(os.path.dirname(IQAMAHS_FILE), exist_ok=True)
    with open(IQAMAHS_FILE, 'w') as f:
        json.dump(cleaned, f)
    return jsonify(cleaned)


if __name__ == '__main__':
    _check_env()
    port = int(os.environ.get("PORT", 7000))
    app.run(host="0.0.0.0", port=port)
