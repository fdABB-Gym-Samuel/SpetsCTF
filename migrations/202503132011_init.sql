CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE classes (
    name VARCHAR(16) NOT NULL PRIMARY KEY,
    school VARCHAR(256)
);

CREATE TABLE users (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    display_name VARCHAR(64),
    represents_class VARCHAR(16),
    FOREIGN KEY (represents_class) REFERENCES classes(name)
);

CREATE TYPE category AS ENUM (
    'crypto',
    'forensics',
    'misc',
    'osint'
    'pwn',
    'reversing',
    'web'
);

CREATE TABLE challenges (
    challenge_id VARCHAR(256) PRIMARY KEY,
    points INT NOT NULL,
    challenge_category category DEFAULT 'misc'
);

CREATE TABLE completions (
    challenge_id VARCHAR(256) NOT NULL,
    user_id UUID NOT NULL,
    when_completed TIMESTAMP DEFAULT now(),
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO classes (name, school) VALUES
    ('V220S', 'Hitachigymnasiet Västerås'),
    ('V230S', 'Hitachigymnasiet Västerås'),
    ('V240S', 'Hitachigymnasiet Västerås')
;
