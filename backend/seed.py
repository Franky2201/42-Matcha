import sys
import os
import json
import random
import urllib.request
from werkzeug.security import generate_password_hash
import psycopg2
from psycopg2.extras import execute_values

if len(sys.argv) != 2:
    print("Erreur: Mot de passe manquant.")
    sys.exit(1)

password = sys.argv[1]
password_hash = generate_password_hash(password)

DB_HOST = os.environ.get("POSTGRES_HOST", "matcha-db")
DB_PORT = os.environ.get("POSTGRES_PORT", "5432")
DB_USER = os.environ.get("POSTGRES_USER", "postgres")
DB_PASS = os.environ.get("POSTGRES_PASSWORD", "postgres")
DB_NAME = os.environ.get("POSTGRES_DB", "matcha")

print("Téléchargement de 500 profils depuis RandomUser...")
req = urllib.request.Request("https://randomuser.me/api/?results=500&nat=fr,us,gb")
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

results = data.get("results", [])
tags_pool = ["vegan", "geek", "sport", "art", "voyage", "musique", "cinema", "nature", "food", "photo", "gaming"]

users_data = []
for u in results:
    email = u['email']
    username = u['login']['username'] + str(random.randint(100, 9999))
    firstname = u['name']['first']
    lastname = u['name']['last']
    gender = u['gender']
    lat = float(u['location']['coordinates']['latitude'])
    lon = float(u['location']['coordinates']['longitude'])
    photo = u['picture']['large']
    
    pref = random.choice(['male', 'female', 'all'])
    bio = f"Salut, je suis {firstname} ! J'ai hâte de faire de nouvelles rencontres."
    fame = round(random.uniform(0.5, 5.0), 1)
    tags = random.sample(tags_pool, k=random.randint(2, 5))
    
    users_data.append((
        email, username, firstname, lastname, password_hash,
        True, gender, pref, bio, fame, lat, lon, tags, [photo]
    ))

print("Insertion dans PostgreSQL...")
try:
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME
    )
    cur = conn.cursor()
    
    insert_query = """
        INSERT INTO users (
            email, username, firstname, lastname, password_hash,
            is_verified, gender, preference, biography, fame_rating,
            latitude, longitude, tags, photos
        ) VALUES %s
        ON CONFLICT (email) DO NOTHING;
    """
    
    execute_values(cur, insert_query, users_data)
    conn.commit()
    cur.close()
    conn.close()
    print(f"Succès ! {len(users_data)} profils ont été ajoutés.")
except Exception as e:
    print(f"Erreur DB : {e}")
    sys.exit(1)
