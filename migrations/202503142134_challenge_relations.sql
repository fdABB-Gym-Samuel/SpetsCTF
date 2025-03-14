CREATE TABLE challenge_creations (
    author INT REFERENCES users(github_id) ON DELETE CASCADE,
    challenge_id VARCHAR(256) REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    PRIMARY KEY (author, challenge_id)
);
