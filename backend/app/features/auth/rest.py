import os
from flask import Blueprint, url_for, redirect, current_app, make_response, abort
from app.core.oauth import oauth
from app.features.auth.service import process_oauth_user
from app.core.security import create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login/<provider>')
def login_provider(provider):
    if provider not in ['42', 'google']:
        abort(404)
        
    redirect_uri = url_for('auth.auth_callback', provider=provider, _external=True)
    client = getattr(oauth, 'intra42' if provider == '42' else provider)
    return client.authorize_redirect(redirect_uri)

@auth_bp.route('/callback/<provider>')
def auth_callback(provider):
    if provider not in ['42', 'google']:
        abort(404)
        
    client = getattr(oauth, 'intra42' if provider == '42' else provider)
    token = client.authorize_access_token()
    access_token = token.get('access_token')
    
    if provider == '42':
        resp = client.get('me')
        resp.raise_for_status()
        user_info = resp.json()
    else:
        user_info = token.get('userinfo')
    
    user_dict = process_oauth_user(current_app.config['DB_POOL'], provider, user_info, access_token)
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
