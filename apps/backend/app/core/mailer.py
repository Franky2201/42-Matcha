async def send_verification_email(email: str, token: str):
    verification_link = f"http://localhost:5173/verify-email?token={token}"

    print("\n--- MOCK EMAIL ---")
    print(f"To: {email}")
    print("Subject: Veuillez vérifier votre compte Matcha")
    print(
        f"Body: Cliquez sur ce lien pour vérifier votre compte : \n{verification_link}"
    )
    print("------------------\n")


async def send_password_reset_email(email: str, token: str):
    reset_link = f"http://localhost:5173/reset-password?token={token}"

    print("\n--- MOCK EMAIL ---")
    print(f"To: {email}")
    print("Subject: Réinitialisation de votre mot de passe Matcha")
    print(
        f"Body: Cliquez sur ce lien pour choisir un nouveau mot de passe : \n"
        f"{reset_link}"
    )
    print("------------------\n")
