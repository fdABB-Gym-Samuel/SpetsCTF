
INSERT INTO classes (name, school) VALUES
('V2401', 'Hitachigymnasiet Västerås'),
('V2301', 'Hitachigymnasiet Västerås'),
('V2201', 'Hitachigymnasiet Västerås'),
('V2402', 'Hitachigymnasiet Västerås'),
('V2302', 'Hitachigymnasiet Västerås'),
('V2202', 'Hitachigymnasiet Västerås'),
('V2403', 'Hitachigymnasiet Västerås'),
('V2303', 'Hitachigymnasiet Västerås'),
('V2203', 'Hitachigymnasiet Västerås');

INSERT INTO users (github_id, github_username, display_name, represents_class, is_admin) VALUES
(101, 'octocat', 'Octavia Cat', 'V2401', FALSE),
(102, 'dev123', 'Devon Smith', 'V2301', TRUE),
(103, 'code_master', 'Cody Masterson', 'V2201', FALSE),
(104, 'history_buff', 'Hannah History', 'V2402', FALSE),
(105, 'artistic_ace', 'Ariana Art', 'V2302', FALSE),
(106, 'fit_guru', 'Fiona Fitness', 'V2202', TRUE),
(107, 'techie', 'Terry Tech', 'V2403', FALSE),
(108, 'music_lover', 'Mia Music', 'V2303', FALSE),
(109, 'bio_buddy', 'Bobby Biology', 'V2203', FALSE),
(110, 'chem_champ', 'Charlie Chemistry', 'V2302', TRUE);

INSERT INTO flag (flag, flag_format) VALUES
('ctf{welcome_to_the_challenge}', 'ctf{...}'),
('ctf{solving_puzzles_is_fun}', 'ctf{...}'),
('ctf{keep_calming_and_carry_on}', 'ctf{...}'),
('ctf{the_flag_is_hidden_here}', 'ctf{...}'),
('ctf{you_found_the_secret_code}', 'ctf{...}'),
('ctf{hacking_is_a_skill}', 'ctf{...}'),
('ctf{never_give_up}', 'ctf{...}'),
('ctf{explore_the_unknown}', 'ctf{...}'),
('ctf{challenge_accepted}', 'ctf{...}'),
('ctf{victory_is_yours}', 'ctf{...}');

INSERT INTO ctf_events (short_name, display_name, start_time, end_time, max_team_size) VALUES
('spring2025', 'Spring 2025 Capture The Flag', '2025-03-01 10:00:00+00', '2025-03-29 18:00:00+00', 5),
('hackathon2025', '2025 Hackathon Challenge', '2025-03-15 09:00:00+00', '2025-03-15 21:00:00+00', 4),
('summer2025', 'Summer 2025 CTF Extravaganza', '2025-03-10 12:00:00+00', '2025-03-10 20:00:00+00', 6),
('fall2025', 'Fall 2025 Capture The Flag', '2025-03-20 11:00:00+00', '2025-03-20 19:00:00+00', 5),
('winter2025', 'Winter 2025 CTF Challenge', '2025-03-25 10:00:00+00', '2025-03-25 18:00:00+00', 3),
('ctf2025', '2025 Global CTF Championship', '2025-03-30 08:00:00+00', '2025-03-30 20:00:00+00', 7),
('online2025', 'Online CTF 2025', '2025-03-05 09:00:00+00', '2025-03-05 17:00:00+00', 5),
('local2025', 'Local CTF 2025', '2025-03-12 10:00:00+00', '2025-03-19 16:00:00+00', 4),
('ctf_challenge', 'CTF Challenge Series 2025', '2025-03-18 10:00:00+00', '2025-03-18 18:00:00+00', 5),
('ctf_fest', 'CTF Festival 2025', '2025-03-28 09:00:00+00', '2025-03-28 19:00:00+00', 6);


INSERT INTO challenges (challenge_id, points, display_name, description, challenge_category, challenge_sub_categories, flag, ctf) VALUES
('challenge2', 150, 'Crypto Cracking', 'Decrypt the given message using the provided hints.', 'crypto', '10010100', 2, 1),
('challenge3', 200, 'Forensics Investigation', 'Analyze the provided data to find the hidden flag.', 'forensics', '10010100', 3, 2),
('challenge4', 250, 'Intro to OSINT', 'Use open-source intelligence to gather information.', 'osint', '10010100', 4, 2),
('challenge5', 300, 'Web Exploitation', 'Find vulnerabilities in the web application.', 'web', '10010100', 5, 3),
('challenge6', 350, 'Pwn the Server', 'Gain access to the server and retrieve the flag.', 'pwn', '10010100', 6, 3),
('challenge7', 400, 'Reversing Challenge', 'Reverse engineer the binary to find the flag.', 'reversing', '10010100', 7, 4),
('challenge8', 450, 'Miscellaneous Challenge', 'A surprise challenge with various tasks.', 'misc', '10010100', 8, 4),
('challenge9', 500, 'Advanced Crypto', 'Solve the complex cryptographic puzzle.', 'crypto', '10010100', 9, 5)


