-- Test Data for CTF platform schema

-- 1. Flags (15 flags for 15 challenges)
INSERT INTO flag (id, flag, flag_format) VALUES
  (1, 'FLAG{crypto101}', 'string'),
  (2, 'FLAG{forensic_feast}', 'string'),
  (3, 'FLAG{intro_explore}', 'string'),
  (4, 'FLAG{misc_mystery}', 'string'),
  (5, 'FLAG{osint_opener}', 'string'),
  (6, 'FLAG{pwn_party}', 'string'),
  (7, 'FLAG{reverse_me}', 'string'),
  (8, 'FLAG{web_wonder}', 'string'),
  (9, 'FLAG{crypto_challenge2}', 'string'),
  (10, 'FLAG{forensics2}', 'string'),
  (11, 'FLAG{intro2}', 'string'),
  (12, 'FLAG{misc2}', 'string'),
  (13, 'FLAG{osint2}', 'string'),
  (14, 'FLAG{pwn2}', 'string'),
  (15, 'FLAG{rev2}', 'string');

-- 2. CTF events (5 events, some ended, some ongoing/future)
INSERT INTO ctf_events (id, short_name, display_name, start_time, end_time, max_team_size) VALUES
  (1, 'PastCTF1', 'Past CTF April', '2025-03-01 09:00:00+00', '2025-03-02 21:00:00+00', 4),
  (2, 'PastCTF2', 'Early Bird CTF', '2024-09-15 10:00:00+00', '2024-09-15 18:00:00+00', 3),
  (3, 'OngoingMay', 'May Madness CTF', '2025-05-01 08:00:00+00', '2025-06-01 20:00:00+00', 5),
  (4, 'FutureCTF', 'Summer CTF 2025', '2025-06-01 00:00:00+00', '2025-06-30 23:59:59+00', 4),
  (5, 'PastMar', 'March Mayhem', '2025-02-15 12:00:00+00', '2025-02-16 12:00:00+00', 2);

-- 3. Users (20 users across classes)
INSERT INTO users (github_id, github_username, display_name, represents_class, is_admin) VALUES
  (1010, 'alice', 'Alice A', 'V220S', false),
  (1011, 'bob', 'Bob B', 'V220S', false),
  (1012, 'carol', 'Carol C', 'V230S', false),
  (1013, 'dave', 'Dave D', 'V230S', false),
  (1014, 'eve', 'Eve E', 'V240S', false),
  (1015, 'frank', 'Frank F', 'V240S', false),
  (1016, 'grace', 'Grace G', 'V220S', false),
  (1017, 'heidi', 'Heidi H', 'V230S', false),
  (1018, 'ivan', 'Ivan I', 'V240S', false),
  (1019, 'judy', 'Judy J', 'V230S', false),
  (1020, 'mallory', 'Mallory M', 'V220S', false),
  (1021, 'ned', 'Ned N', 'V230S', false),
  (1022, 'oscar', 'Oscar O', 'V240S', false),
  (1023, 'peggy', 'Peggy P', 'V220S', false),
  (1024, 'trent', 'Trent T', 'V230S', false),
  (1025, 'victor', 'Victor V', 'V240S', false),
  (1026, 'walter', 'Walter W', 'V220S', false),
  (1027, 'xavier', 'Xavier X', 'V230S', false),
  (1028, 'yvonne', 'Yvonne Y', 'No Class', false),
  (1029, 'zara', 'Zara Z', 'No Class', true);

-- 4. Challenges (15 total, distributed across 5 CTFs)
INSERT INTO challenges (challenge_id, points, display_name, description, challenge_category, challenge_sub_categories, flag, ctf, approved) VALUES
  ('crypto01', 100, 'Basic Crypto', 'Decrypt the message', 'crypto', '10000000', 1, 1, true),
  ('forensics01', 200, 'Memory Forensic', 'Analyze the dump', 'forensics', '01000000', 2, 1, true),
  ('intro01', 50, 'Welcome Challenge', 'Say hello', 'introduction', '00100000', 3, 1, true),
  ('misc01', 150, 'Random Task', 'Just do something', 'misc', '00010000', 4, 1, true),
  ('osint01', 120, 'Whois', 'Find the owner', 'osint', '00001000', 5, 1, true),
  ('pwn01', 250, 'Heap Exploit', 'Exploit the binary', 'pwn', '00000100', 6, 1, true),
  ('rev01', 300, 'Reverse Me', 'Reverse the code', 'reversing', '00000010', 7, 1, true),
  ('web01', 80, 'SQL Injection', 'Bypass the login', 'web', '00000001', 8, 1, true),
  ('crypto02', 110, 'XOR Crypto', 'Break XOR cipher', 'crypto', '10000000', 9, 1, true),
  ('forensics02', 210, 'Image Forensic', 'Hidden data in image', 'forensics', '01000000', 10, 1, true),
  ('intro02', 60, 'Second Intro', 'Intro part 2', 'introduction', '00100000', 11, 1, true),
  ('misc02', 160, 'Fun Task', 'Misc fun', 'misc', '00010000', 12, 1, true),
  ('osint02', 130, 'GeoLocate', 'Locate the tweet', 'osint', '00001000', 13, 2, true),
  ('pwn02', 260, 'Stack Smash', 'Smash the stack', 'pwn', '00000100', 14, 3, true),
  ('rev02', 310, 'Reverse v2', 'Harder reverse', 'reversing', '00000010', 15, 4, true);

-- 5. Teams (7 teams in total)
INSERT INTO ctf_teams (id, website, name, ctf) VALUES
  (1, 'http://teamalpha.example', 'Team Alpha', 1),
  (2, 'http://teambeta.example', 'Team Beta', 1),
  (3, 'http://teamgamma.example', 'Team Gamma', 1),
  (4, 'http://teamdelta.example', 'Team Delta', 1),
  (5, 'http://teamepsilon.example', 'Team Epsilon', 1),
  (6, 'http://teamzeta.example', 'Team Zeta', 1),
  (7, 'http://teameta.example', 'Team Eta', 1);

-- 6. Team memberships
-- Assign first 14 users across teams
INSERT INTO ctf_teams_members (user_id, team)
SELECT id, 1 FROM users WHERE github_username IN ('alice','bob','carol','dave');
INSERT INTO ctf_teams_members (user_id, team)
SELECT id, 2 FROM users WHERE github_username IN ('eve','frank','grace');
INSERT INTO ctf_teams_members (user_id, team)
SELECT id, 3 FROM users WHERE github_username IN ('heidi','ivan');
INSERT INTO ctf_teams_members (user_id, team)
SELECT id, 4 FROM users WHERE github_username IN ('judy','mallory','ned');
INSERT INTO ctf_teams_members (user_id, team)
SELECT id, 5 FROM users WHERE github_username IN ('oscar','peggy');
INSERT INTO ctf_teams_members (user_id, team)
SELECT id, 6 FROM users WHERE github_username = 'trent';
INSERT INTO ctf_teams_members (user_id, team)
SELECT id, 7 FROM users WHERE github_username IN ('victor','walter','xavier','yvonne','zara');

-- 7. Submissions (ctf_submissions) across different challenges and CTFS
INSERT INTO ctf_submissions (challenge, user_id, time, success, ctf, submitted_data) VALUES
  ('crypto01', (SELECT id FROM users WHERE github_username='alice'), '2025-03-01 10:00:00+00', true, 1, 'FLAG{crypto101}'),
  ('forensics01', (SELECT id FROM users WHERE github_username='bob'), '2025-03-01 11:00:00+00', false, 1, 'wrong'),
  ('intro01', (SELECT id FROM users WHERE github_username='carol'), '2025-03-01 12:00:00+00', true, 1, 'FLAG{intro_explore}'),
  ('misc01', (SELECT id FROM users WHERE github_username='eve'), '2024-09-15 11:30:00+00', true, 1, 'FLAG{misc_mystery}'),
  ('osint01', (SELECT id FROM users WHERE github_username='frank'), '2024-09-15 12:00:00+00', true, 1, 'FLAG{osint_opener}'),
  ('pwn01', (SELECT id FROM users WHERE github_username='grace'), '2024-09-15 13:00:00+00', false, 1, 'guess'),
  ('rev01', (SELECT id FROM users WHERE github_username='heidi'), '2025-05-02 09:00:00+00', true, 1, 'FLAG{reverse_me}'),
  ('web01', (SELECT id FROM users WHERE github_username='ivan'), '2025-05-02 10:00:00+00', true, 1, 'FLAG{web_wonder}'),
  ('crypto02', (SELECT id FROM users WHERE github_username='judy'), '2025-05-15 14:00:00+00', false, 1, 'bad'),
  ('forensics02', (SELECT id FROM users WHERE github_username='mallory'), '2025-06-05 15:00:00+00', false, 1, 'nope'),
  ('intro02', (SELECT id FROM users WHERE github_username='ned'), '2025-06-10 16:00:00+00', true, 1, 'FLAG{intro2}'),
  ('misc02', (SELECT id FROM users WHERE github_username='oscar'), '2025-06-15 17:00:00+00', true, 1, 'FLAG{misc2}'),
  ('osint02', (SELECT id FROM users WHERE github_username='peggy'), '2025-02-15 13:00:00+00', true, 1, 'FLAG{osint2}'),
  ('pwn02', (SELECT id FROM users WHERE github_username='trent'), '2025-02-15 14:00:00+00', false, 1, 'wrong'),
  ('rev02', (SELECT id FROM users WHERE github_username='victor'), '2025-02-15 15:00:00+00', true, 1, 'FLAG{rev2}');
