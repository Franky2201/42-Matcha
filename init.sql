CREATE TYPE user_gender AS ENUM ('male', 'female');
CREATE TYPE user_preference AS ENUM ('all', 'male', 'female');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    last_name VARCHAR(100),
    first_name VARCHAR(100),
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

INSERT INTO users (email, password_hash, first_name, last_name)
VALUES (
    'test@matcha.com',
    '$2a$12$lxcIPF4h7s6TPz7yYlMPXO4Q0mmMJWU/phxw/bkyqJEfuZk/mnuSa',
    'Test',
    'User'
) ON CONFLICT (email) DO NOTHING;
