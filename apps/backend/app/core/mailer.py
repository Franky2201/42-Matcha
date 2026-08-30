import os
from email.message import EmailMessage

import aiosmtplib

SMTP_HOST = os.getenv("SMTP_HOST", "")
_smtp_port_raw = os.getenv("SMTP_PORT", "587")
SMTP_PORT = int(_smtp_port_raw) if _smtp_port_raw and _smtp_port_raw.isdigit() else 587
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@matcha.local")


async def send_email_async(to_email: str, subject: str, body: str) -> None:
    print("\n--- DEBUG EMAIL ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: \n{body}")
    print("-------------------\n")

    if not SMTP_USER or not SMTP_PASSWORD:
        print("INFO: Identifiants SMTP manquants. Envoi réel annulé.")
        return

    message = EmailMessage()
    message["From"] = FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True,
        )
        print("INFO: E-mail envoyé avec succès via SMTP.")
    except Exception as e:
        print(f"ERREUR: Échec de l'envoi SMTP : {e}")


async def send_verification_email(email: str, token: str) -> None:
    link = f"http://localhost:5173/verify-email?token={token}"
    subject = "Veuillez vérifier votre compte Matcha"
    body = (
        "Bonjour,\n\n"
        "Bienvenue sur Matcha ! Cliquez sur le lien ci-dessous "
        "pour vérifier votre compte :\n"
        f"{link}\n\n"
        "L'équipe Matcha"
    )
    await send_email_async(email, subject, body)


async def send_password_reset_email(email: str, token: str) -> None:
    link = f"http://localhost:5173/reset-password?token={token}"
    subject = "Réinitialisation de votre mot de passe Matcha"
    body = (
        "Bonjour,\n\n"
        "Vous avez demandé la réinitialisation de votre mot de passe. "
        "Cliquez sur ce lien pour en choisir un nouveau :\n"
        f"{link}\n\n"
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.\n\n"
        "L'équipe Matcha"
    )
    await send_email_async(email, subject, body)
