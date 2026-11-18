import os
from flask import Blueprint, url_for, redirect, current_app, make_response
from app.core.oauth import oauth
from app.features.auth.service import process_oauth_user
from app.core.security import create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login/42')
def login_42():
    redirect_uri = url_for('auth.auth_42_callback', _external=True)
    return oauth.intra42.authorize_redirect(redirect_uri)

@auth_bp.route('/callback/42')
def auth_42_callback():
    token = oauth.intra42.authorize_access_token()
    access_token = token.get('access_token')
    
    resp = oauth.intra42.get('me')
    resp.raise_for_status()
    user_info = resp.json()

    user_dict = process_oauth_user(current_app.config['DB_POOL'], '42', user_info, access_token)
    jwt_token = create_access_token(user_dict['id'])
    
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    
    response = make_response(redirect(f"{frontend_url}/oauth/callback"))
    
    response.set_cookie(
        "token",
        jwt_token,
        httponly=True,
        samesite="Lax",
        secure=os.environ.get("FLASK_ENV") == "production",
        path="/"
    )
    
    return response
