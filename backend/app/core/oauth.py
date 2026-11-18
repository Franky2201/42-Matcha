import os
from authlib.integrations.flask_client import OAuth

oauth = OAuth()

def init_oauth(app):
    oauth.init_app(app)
    oauth.register(
        name='intra42',
        client_id=os.environ.get('INTRA42_CLIENT_ID'),
        client_secret=os.environ.get('INTRA42_CLIENT_SECRET'),
        access_token_url='https://api.intra.42.fr/oauth/token',
        authorize_url='https://api.intra.42.fr/oauth/authorize',
        api_base_url='https://api.intra.42.fr/v2/',
        client_kwargs={'scope': 'public'}
    )
