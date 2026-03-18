import os
import sqlite3
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = os.environ.get("DB_PATH", "./leads.db")

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.purelymail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", SMTP_USER)
SENDER_NAME = os.environ.get("SENDER_NAME", "Glowbal Team")
APP_LINK = os.environ.get("APP_LINK", "https://auerlian.github.io/GlowBal/?app=1")


def db_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            goal TEXT,
            source TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS mentor_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            university_name TEXT,
            mentor_name TEXT,
            mentor_course TEXT,
            slot TEXT,
            requester_email TEXT,
            requester_name TEXT,
            created_at TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def send_html_email(to_email: str, subject: str, html: str):
    if not (SMTP_USER and SMTP_PASS and SENDER_EMAIL):
        raise RuntimeError("SMTP env vars missing")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SENDER_EMAIL, [to_email], msg.as_string())


def send_welcome_email(to_email: str, name: str):
    subject = "Your Glowbal shortlist creator link ✨"
    display_name = name.strip() if name else "there"

    html = f"""
    <html>
      <body style='font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;'>
        <h2>Hey {display_name},</h2>
        <p>Thanks for signing up for Glowbal.</p>
        <p>Use your private link to try the shortlist creator:</p>
        <p><a href='{APP_LINK}' style='display:inline-block;background:#ec4899;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;'>Open Glowbal Creator</a></p>
        <p>Or copy this URL: <br/><a href='{APP_LINK}'>{APP_LINK}</a></p>
        <hr/>
        <p style='font-size:12px;color:#6b7280;'>Sent by Glowbal</p>
      </body>
    </html>
    """

    send_html_email(to_email, subject, html)


@app.get("/health")
def health():
    return {"ok": True, "service": "glowbal-mail-relay"}


@app.post("/api/signup")
def signup():
    data = request.get_json(force=True, silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    goal = (data.get("goal") or "").strip()
    source = (data.get("source") or "landing-signup").strip()

    if not email or "@" not in email:
        return jsonify({"ok": False, "error": "Valid email is required"}), 400

    now = datetime.utcnow().isoformat() + "Z"

    conn = db_conn()
    try:
        conn.execute(
            """
            INSERT INTO leads (name, email, goal, source, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
              name=excluded.name,
              goal=excluded.goal,
              source=excluded.source,
              updated_at=excluded.updated_at
            """,
            (name, email, goal, source, now, now),
        )
        conn.commit()
    finally:
        conn.close()

    email_error = None
    try:
        send_welcome_email(email, name)
    except Exception as exc:
        email_error = str(exc)

    return jsonify({"ok": True, "emailSent": email_error is None, "emailError": email_error})


@app.post("/api/mentor-request")
def mentor_request():
    data = request.get_json(force=True, silent=True) or {}
    university_name = (data.get("universityName") or "").strip()
    mentor_name = (data.get("mentorName") or "").strip()
    mentor_course = (data.get("mentorCourse") or "").strip()
    slot = (data.get("slot") or "").strip()
    requester_email = (data.get("email") or "").strip().lower()
    requester_name = (data.get("name") or "").strip()

    if not requester_email or "@" not in requester_email:
        return jsonify({"ok": False, "error": "Valid email is required"}), 400
    if not university_name or not mentor_name or not slot:
        return jsonify({"ok": False, "error": "University, mentor and slot are required"}), 400

    now = datetime.utcnow().isoformat() + "Z"
    conn = db_conn()
    try:
      conn.execute(
        """
        INSERT INTO mentor_requests (university_name, mentor_name, mentor_course, slot, requester_email, requester_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (university_name, mentor_name, mentor_course, slot, requester_email, requester_name, now),
      )
      conn.commit()
    finally:
      conn.close()

    display_name = requester_name if requester_name else "there"
    html = f"""
    <html>
      <body style='font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;'>
        <h2>Hi {display_name},</h2>
        <p>Your mentor session request has been sent.</p>
        <ul>
          <li><strong>University:</strong> {university_name}</li>
          <li><strong>Mentor:</strong> {mentor_name}</li>
          <li><strong>Course:</strong> {mentor_course}</li>
          <li><strong>Requested time:</strong> {slot}</li>
        </ul>
        <p>The mentor will get in touch with you to discuss next steps.</p>
        <p style='font-size:12px;color:#6b7280;'>Sent by Glowbal</p>
      </body>
    </html>
    """

    email_error = None
    try:
      send_html_email(requester_email, "Mentor request received — Glowbal", html)
    except Exception as exc:
      email_error = str(exc)

    return jsonify({"ok": True, "emailSent": email_error is None, "emailError": email_error})


@app.get("/api/leads")
def list_leads():
    token = request.headers.get("x-admin-token", "")
    if token != os.environ.get("ADMIN_TOKEN", ""):
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    conn = db_conn()
    rows = conn.execute("SELECT * FROM leads ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify({"ok": True, "leads": [dict(r) for r in rows]})


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")))
