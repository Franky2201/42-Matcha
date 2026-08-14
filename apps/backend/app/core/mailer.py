async def send_verification_email(email: str, token: str):
    verification_link = f"http://localhost:5173/verify-email?token={token}"

    print("\n--- MOCK EMAIL ---")
    print(f"To: {email}")
    print("Subject: Veuillez vérifier votre compte Matcha")
    print(
        f"Body: Cliquez sur ce lien pour vérifier votre compte : \n{verification_link}"
    )
    print("------------------\n")
