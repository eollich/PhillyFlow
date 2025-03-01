import os
import secrets
from dotenv import load_dotenv
from datetime import timedelta

SECRET_KEY_FILE = ".env"

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))


def gen_or_load_secret():
    secret_key = os.environ.get("SECRET_KEY")
    if secret_key is None:
        secret_key = secrets.token_hex(16)
        with open(SECRET_KEY_FILE, "a") as f:
            f.write(f"SECRET_KEY={secret_key}\n")

    return secret_key


class Config:
    SECRET_KEY = gen_or_load_secret()
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL"
    ) or "sqlite:///" + os.path.join(basedir, "app.db")
