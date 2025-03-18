CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- A class has a name and a school
CREATE TABLE classes (
    name VARCHAR(16) NOT NULL PRIMARY KEY,
    school VARCHAR(256)
);

-- Insert default values
INSERT INTO classes (name, school) VALUES
    ('V220S', 'Hitachigymnasiet Västerås'),
    ('V230S', 'Hitachigymnasiet Västerås'),
    ('V240S', 'Hitachigymnasiet Västerås');

CREATE TABLE users (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id INT NOT NULL UNIQUE,
    github_username TEXT UNIQUE,
    display_name VARCHAR(64),
    represents_class VARCHAR(16),
    is_admin BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (represents_class) REFERENCES classes(name)
);

CREATE TYPE category AS ENUM (
    'blockchain',
    'crypto',
    'forensics',
    'introduction',
    'misc',
    'osint',
    'pwn',
    'reversing',
    'web'
);

CREATE TABLE flag (
    id SERIAL PRIMARY KEY,
    flag TEXT NOT NULL,
    flag_format TEXT
);

CREATE TABLE ctf_events (
    id SERIAL PRIMARY KEY,
    short_name VARCHAR(256) NOT NULL,
    display_name TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    max_team_size SMALLINT
);

CREATE TABLE challenges (
    challenge_id VARCHAR(256) PRIMARY KEY,
    points INT NOT NULL,
    display_name VARCHAR(256),
    description TEXT,
    challenge_category category DEFAULT 'misc',
    flag INT,
    ctf INT,
    FOREIGN KEY (flag) REFERENCES flag(id),
    FOREIGN KEY (ctf) REFERENCES ctf_events(id)
);

CREATE TABLE wargame_submissions (
    id SERIAL PRIMARY KEY,
    challenge VARCHAR(256) NOT NULL,
    user_id UUID NOT NULL,
    time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_data TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge) REFERENCES challenges(challenge_id)
);

CREATE TABLE ctf_teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ctf INT NOT NULL,
    FOREIGN KEY (ctf) REFERENCES ctf_events(id)
);

CREATE TABLE ctf_teams_members (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team INT REFERENCES ctf_teams(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, team)
);

CREATE TABLE ctf_submissions (
    id SERIAL PRIMARY KEY,
    challenge VARCHAR(256) NOT NULL,
    user_id UUID NOT NULL,
    time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    ctf INT NOT NULL,
    submitted_data TEXT,
    FOREIGN KEY (ctf) REFERENCES ctf_events(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge) REFERENCES challenges(challenge_id)
);

CREATE TYPE challenge_resource_type AS ENUM (
    'cmd',
    'file',
    'web'
);

CREATE TABLE challenge_resources (
    id SERIAL PRIMARY KEY,
    challenge VARCHAR(256) NOT NULL,
    type challenge_resource_type NOT NULL DEFAULT 'file',
    content TEXT NOT NULL,
    FOREIGN KEY (challenge) REFERENCES challenges(challenge_id)
);

CREATE TABLE user_sessions (
    id TEXT NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL
);
