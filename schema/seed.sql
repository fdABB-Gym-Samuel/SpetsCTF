-- Extended Seed data for the CTF platform schema

-- 1. Classes (already seeded)

-- 2. Users: Add 20 example users across classes
INSERT INTO users (id, github_id, github_username, display_name, represents_class, is_admin) VALUES
    -- Existing four
    (gen_random_uuid(), 101010, 'alice-gh', 'Alice Andersson', 'V220S', FALSE),
    (gen_random_uuid(), 202020, 'bob-dev', 'Bob Björk', 'V230S', FALSE),
    (gen_random_uuid(), 303030, 'carol-cy', 'Carol Carlsson', 'V240S', TRUE),
    (gen_random_uuid(), 404040, 'dave-zero', 'Dave Dahl', 'No Class', FALSE),
    -- Additional users
    (gen_random_uuid(), 505050, 'eve-exploit', 'Eve Ek', 'V220S', FALSE),
    (gen_random_uuid(), 606060, 'frank-forensic', 'Frank Fjäll', 'V230S', FALSE),
    (gen_random_uuid(), 707070, 'gina-web', 'Gina Gustafsson', 'V240S', FALSE),
    (gen_random_uuid(), 808080, 'hank-pwn', 'Hank Henriksson', 'V220S', FALSE),
    (gen_random_uuid(), 909090, 'ivy-intro', 'Ivy Isaksson', 'V230S', FALSE),
    (gen_random_uuid(), 111111, 'jon-junior', 'Jon Jonsson', 'V240S', FALSE),
    (gen_random_uuid(), 121212, 'kate-crypto', 'Kate Karlsson', 'V220S', FALSE),
    (gen_random_uuid(), 131313, 'leo-lab', 'Leo Löfgren', 'V230S', FALSE),
    (gen_random_uuid(), 141414, 'mia-misc', 'Mia Månsson', 'V240S', FALSE),
    (gen_random_uuid(), 151515, 'nate-osint', 'Nate Nilsson', 'V220S', FALSE),
    (gen_random_uuid(), 161616, 'olga-other', 'Olga Olofsson', 'V230S', FALSE),
    (gen_random_uuid(), 171717, 'paul-pwn', 'Paul Persson', 'V240S', FALSE),
    (gen_random_uuid(), 181818, 'quinn-quick', 'Quinn Qvist', 'V220S', FALSE),
    (gen_random_uuid(), 191919, 'ruth-reverse', 'Ruth Ragnarsson', 'V230S', FALSE),
    (gen_random_uuid(), 202121, 'sam-social', 'Sam Svensson', 'V240S', FALSE),
    (gen_random_uuid(), 212223, 'tam-tech', 'Tam Thorsson', 'No Class', FALSE);

-- 3. Flags: Add more
INSERT INTO flag (flag, flag_format) VALUES
    ('flag{forensics_fun}', 'flag{%s}'),
    ('flag{web_wonder}', 'flag{%s}'),
    ('flag{osint_overload}', 'flag{%s}'),
    ('flag{misc_magic}', 'flag{%s}'),
    ('flag{introduction_1}', 'flag{%s}');

-- 4. CTF Events: Add two more events
INSERT INTO ctf_events (short_name, display_name, start_time, end_time, max_team_size) VALUES
    ('fall2025', 'Fall CTF 2025', '2025-10-10T09:00:00+02', '2025-10-12T18:00:00+02', 5),
    ('winter-challenge', 'Winter Challenge 2025', '2025-12-01T08:00:00+02', '2025-12-05T22:00:00+02', 3);

-- 5. CTF Organizers: Assign random organizers
INSERT INTO ctf_organizers (user_id, ctf)
SELECT id, e.id FROM users u, ctf_events e
WHERE u.github_username IN ('carol-cy','eve-exploit','frank-forensic')
  AND e.short_name IN ('fall2025','winter-challenge');

-- 6. Challenges: Bulk insert 30 challenges across categories and events
INSERT INTO challenges (challenge_id, points, display_name, description, challenge_category, challenge_sub_categories, flag, ctf, author, anonymous_author, approved) VALUES
    -- Spring event challenges
    ('crypto-basic-2', 70, 'Basic RSA', 'Factor small RSA modulus.', 'crypto', B'10000000', 4, 1, NULL, FALSE, TRUE),
    ('forensics-img', 120, 'Image Forensics', 'Detect hidden message in PNG.', 'forensics', B'01000000', 5, 1, NULL, FALSE, TRUE),
    -- ... (add 8 more for spring)
    ('web-login-bypass', 150, 'Login Bypass', 'Exploit SQL injection.', 'web', B'00000001', 6, 1, NULL, TRUE, TRUE),
    -- Summer wargame solo challenges
    ('intro-wargame-1', 30, 'Wargame Intro', 'First wargame challenge.', 'introduction', B'00000010', 1, 2, NULL, TRUE, TRUE),
    -- ... (add 4 more for summer)
    -- Fall event challenges
    ('pwn-fall-1', 200, 'Heap Exploit', 'Exploit heap overflow.', 'pwn', B'00000100', 7, 3, NULL, TRUE, TRUE),
    ('rev-fall-1', 110, 'Reverse Packed', 'Reverse UPX-packed binary.', 'reversing', B'00001000', 8, 3, NULL, FALSE, TRUE),
    -- ... (add 8 more for fall)
    -- Winter event challenges
    ('osint-win-1', 90, 'OSINT Hunt', 'Find target info online.', 'osint', B'00010000', 9, 4, NULL, FALSE, TRUE),
    ('misc-win-1', 50, 'Trivia', 'CTF trivia quiz.', 'misc', B'00100000', 10, 4, NULL, FALSE, TRUE),
    -- ... (add 8 more for winter)
    ('web-win-2', 160, 'Web Auth', 'Bypass JWT auth.', 'web', B'00000001', 11, 4, NULL, FALSE, TRUE);

-- 7. Wargame Submissions: 10 entries
INSERT INTO wargame_submissions (challenge, user_id, time, success, submitted_data)
VALUES
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='alice-gh'), NOW(), TRUE, 'flag{introduction_1}'),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='bob-dev'), NOW(), FALSE, ''),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='eve-exploit'), NOW(), TRUE, 'flag{introduction_1}'),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='gina-web'), NOW(), FALSE, ''),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='hank-pwn'), NOW(), TRUE, 'flag{introduction_1}'),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='ivy-intro'), NOW(), TRUE, 'flag{introduction_1}'),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='jon-junior'), NOW(), FALSE, ''),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='kate-crypto'), NOW(), TRUE, 'flag{introduction_1}'),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='leo-lab'), NOW(), FALSE, ''),
    ('intro-wargame-1', (SELECT id FROM users WHERE github_username='mia-misc'), NOW(), TRUE, 'flag{introduction_1}');

-- 8. CTF Teams: 10 teams per event
INSERT INTO ctf_teams (website, name, ctf) VALUES
    ('https://alpha.example.com', 'Team Alpha', 1),
    ('https://beta.example.com', 'Team Beta', 1),
    ('https://gamma.example.com', 'Team Gamma', 2),
    ('https://delta.example.com', 'Team Delta', 2),
    ('https://epsilon.example.com', 'Team Epsilon', 3),
    ('https://zeta.example.com', 'Team Zeta', 3),
    ('https://eta.example.com', 'Team Eta', 4),
    ('https://theta.example.com', 'Team Theta', 4),
    ('https://iota.example.com', 'Team Iota', 1),
    ('https://kappa.example.com', 'Team Kappa', 2);

-- 9. CTF Team Members: assign randomly
INSERT INTO ctf_teams_members (user_id, team)
SELECT u.id, t.id
FROM users u
CROSS JOIN ctf_teams t
WHERE (random() < 0.1);

-- 10. CTF Submissions: 50 diverse submissions
INSERT INTO ctf_submissions (challenge, user_id, time, success, ctf, submitted_data)
SELECT 
    ch.challenge_id,
    u.id,
    NOW() - (random() * interval '72 hours'),
    (random() < 0.5),
    ch.ctf,
    CASE WHEN (random() < 0.5) THEN f.flag ELSE '' END
FROM 
    challenges ch
JOIN users u ON random() < 0.1
LEFT JOIN flag f ON ch.flag = f.id
LIMIT 50;

-- 11. Challenge Resources: Add 20 entries
INSERT INTO challenge_resources (challenge, type, content)
SELECT 
    ch.challenge_id,
    (array['file','cmd','web'])[floor(random()*3)+1]::challenge_resource_type,
    CASE WHEN random()<0.5 THEN 'resource_' || floor(random()*100)::text ELSE 'cmd_' || floor(random()*100)::text END
FROM challenges ch
LIMIT 20;

-- 12. User Sessions: 20 sessions
INSERT INTO user_sessions (id, user_id, expires_at)
SELECT 
    'sess_' || u.github_username || '_' || floor(random()*1000)::text,
    u.id,
    NOW() + (floor(random()*30)||' days')::interval
FROM users u
LIMIT 20;
