CREATE TYPE user_gender AS ENUM ('male', 'female');
CREATE TYPE user_preference AS ENUM ('all', 'male', 'female');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    gender user_gender,
    preference user_preference DEFAULT 'all',
    biography TEXT,
    fame_rating DECIMAL(5,2) DEFAULT 0.00,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    last_connection TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN DEFAULT FALSE,
    oauth_42 VARCHAR(255) UNIQUE,
    oauth_google VARCHAR(255) UNIQUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, username, lastname, firstname, password_hash)
VALUES (
    'juhanse@matcha.com',
    'juhanse',
    'Hanse',
    'Julien',
    '$2a$12$TCaK2eUoU3gHk3uZJ872..de0VXoYsaBevl5p7h0jJv/zTAnx8hGK'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, username, lastname, firstname, password_hash)
VALUES (
    'michel@matcha.com',
    'michel',
    'Michel',
    'Michel',
    '$2a$12$TCaK2eUoU3gHk3uZJ872..de0VXoYsaBevl5p7h0jJv/zTAnx8hGK'
) ON CONFLICT (email) DO NOTHING;
