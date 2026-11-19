import os
import random
import requests
from app.core.security import create_access_token, verify_password
from app.features.auth.repository import get_user_password_hash
from app.features.auth.schemas import AuthPayload
from psycopg2.extras import RealDictCursor


def authenticate_user(pool, username: str, password: str) -> tuple[any, str | None]:
    user = get_user_password_hash(pool, username)

    if not user or not verify_password(password, user["password_hash"]):
        return AuthPayload(token=None, message="Identifiants invalides"), None

    token = create_access_token(subject=user["id"])
    return AuthPayload(token=None, message="Connexion réussie"), token


def process_oauth_user(pool, provider: str, user_info: dict, provider_token: str = None) -> dict:
    if provider == '42':
        oauth_id = str(user_info['id'])
        email = user_info['email']
        base_username = user_info['login']
        firstname = user_info['first_name']
        lastname = user_info['last_name']
        image_data = user_info.get('image', {})
        photo_url = image_data.get('versions', {}).get('large') or image_data.get('link')
        id_column = 'oauth_42_id'
    elif provider == 'google':
        oauth_id = str(user_info['sub'])
        email = user_info['email']
        base_username = email.split('@')[0]
        firstname = user_info.get('given_name', '')
        lastname = user_info.get('family_name', '')
        photo_url = user_info.get('picture')
        id_column = 'oauth_google_id'
    else:
        raise ValueError("Unsupported provider")

    final_photo = ""
    if photo_url:
        local_photo_name = f"{provider}_{oauth_id}.jpg"
        uploads_dir = os.path.abspath("uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        local_photo_path = os.path.join(uploads_dir, local_photo_name)
        
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            if provider_token and provider == '42':
                headers['Authorization'] = f"Bearer {provider_token}"
                
            response = requests.get(photo_url, headers=headers, timeout=10)
            if response.status_code == 200:
                with open(local_photo_path, 'wb') as f:
                    f.write(response.content)
                final_photo = local_photo_name
        except Exception:
            pass

    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = f"SELECT * FROM users WHERE {id_column} = %s OR email = %s"
            cur.execute(query, (oauth_id, email))
            record = cur.fetchone()
            
            if record:
                if not record.get(id_column):
                    update_query = f"UPDATE users SET {id_column} = %s, is_verified = TRUE WHERE id = %s RETURNING *"
                    cur.execute(update_query, (oauth_id, record['id']))
                    record = cur.fetchone()
                    conn.commit()
                return dict(record)
            
            username = base_username
            while True:
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                if not cur.fetchone():
                    break
                username = f"{base_username}{random.randint(100, 999)}"
            
            insert_query = f"""
                INSERT INTO users (
                    email, username, firstname, lastname, 
                    {id_column}, is_verified, photos
                ) VALUES (%s, %s, %s, %s, %s, TRUE, %s)
                RETURNING *;
            """
            cur.execute(insert_query, (email, username, firstname, lastname, oauth_id, [final_photo] if final_photo else []))
            new_record = cur.fetchone()
            conn.commit()
            return dict(new_record)
    finally:
        pool.putconn(conn)
