BEGIN;

-- ============================================================================
-- 1. FLAGS (30 flags for various challenges)
-- ============================================================================
INSERT INTO
  flag (flag, flag_format)
VALUES
  ('FLAG{welcome_to_ctf}', 'string'),
  ('FLAG{basic_crypto_rocks}', 'string'),
  ('FLAG{find_the_hidden_file}', 'string'),
  ('FLAG{steganography_master}', 'string'),
  ('FLAG{osint_detective_level1}', 'string'),
  ('FLAG{buffer_overflow_pwned}', 'string'),
  ('FLAG{reverse_engineering_101}', 'string'),
  ('FLAG{sql_injection_success}', 'string'),
  ('FLAG{xor_cipher_decoded}', 'string'),
  ('FLAG{memory_dump_analyzed}', 'string'),
  ('FLAG{first_steps_completed}', 'string'),
  ('FLAG{network_forensics_win}', 'string'),
  ('FLAG{social_media_sleuth}', 'string'),
  ('FLAG{heap_exploitation_master}', 'string'),
  ('FLAG{obfuscated_code_cracked}', 'string'),
  ('FLAG{xss_vulnerability_found}', 'string'),
  ('FLAG{rsa_broken}', 'string'),
  ('FLAG{pcap_analysis_expert}', 'string'),
  ('FLAG{getting_started}', 'string'),
  ('FLAG{misc_challenge_solved}', 'string'),
  ('FLAG{geolocation_expert}', 'string'),
  ('FLAG{format_string_exploited}', 'string'),
  ('FLAG{assembly_decoded}', 'string'),
  ('FLAG{jwt_token_forged}', 'string'),
  ('FLAG{aes_decrypted}', 'string'),
  ('FLAG{disk_image_recovered}', 'string'),
  ('FLAG{beginner_champion}', 'string'),
  ('FLAG{zip_password_cracked}', 'string'),
  ('FLAG{metadata_revealed}', 'string'),
  ('FLAG{shellcode_executed}', 'string');

-- ============================================================================
-- 2. CTF EVENTS (7 events: past, ongoing, and future)
-- ============================================================================
INSERT INTO
  ctf_events (
    short_name,
    display_name,
    start_time,
    end_time,
    max_team_size
  )
VALUES
  -- Past events
  (
    'winter2025',
    'Winter Warmup CTF 2025',
    now() - interval '10 months',
    now() - interval '10 months' + interval '24 hours',
    4
  ),
  (
    'spring2025',
    'Spring Security Challenge',
    now() - interval '7 months',
    now() - interval '7 months' + interval '48 hours',
    5
  ),
  (
    'summer2025',
    'Summer Hacking Festival',
    now() - interval '4 months',
    now() - interval '4 months' + interval '72 hours',
    6
  ),
  (
    'fall2025',
    'Autumn Attack Challenge',
    now() - interval '2 months',
    now() - interval '2 months' + interval '36 hours',
    4
  ),
  -- Ongoing event
  (
    'current',
    'December Cyber Showdown',
    now() - interval '2 hours',
    now() + interval '22 hours',
    5
  ),
  -- Future events
  (
    'newyear2026',
    'New Year CTF 2026',
    now() + interval '1 week',
    now() + interval '1 week' + interval '48 hours',
    4
  ),
  (
    'winter2026',
    'Winter Championship 2026',
    now() + interval '2 months',
    now() + interval '2 months' + interval '72 hours',
    6
  );

-- ============================================================================
-- 3. USERS (25 users with varied attributes)
-- ============================================================================
INSERT INTO
  users (
    github_id,
    github_username,
    display_name,
    represents_class,
    is_admin
  )
VALUES
  -- V220S class
  (
    10001,
    'alice_sec',
    'Alice Anderson',
    'V220S',
    false
  ),
  (
    10002,
    'bob_crypto',
    'Bob Bennett',
    'V220S',
    false
  ),
  (
    10003,
    'charlie_web',
    'Charlie Chen',
    'V220S',
    false
  ),
  (10004, 'diana_pwn', 'Diana Davis', 'V220S', false),
  (
    10005,
    'erik_rev',
    'Erik Eriksson',
    'V220S',
    false
  ),
  -- V230S class
  (
    10006,
    'fiona_forensics',
    'Fiona Fischer',
    'V230S',
    false
  ),
  (
    10007,
    'george_osint',
    'George Garcia',
    'V230S',
    false
  ),
  (
    10008,
    'hannah_misc',
    'Hannah Hansen',
    'V230S',
    true
  ),
  (
    10009,
    'ivan_crypto',
    'Ivan Ivanov',
    'V230S',
    false
  ),
  (
    10010,
    'julia_web',
    'Julia Johnson',
    'V230S',
    false
  ),
  -- V240S class
  (10011, 'kevin_pwn', 'Kevin Klein', 'V240S', false),
  (10012, 'laura_rev', 'Laura Lopez', 'V240S', false),
  (
    10013,
    'mike_forensics',
    'Mike Miller',
    'V240S',
    false
  ),
  (
    10014,
    'nina_osint',
    'Nina Nilsson',
    'V240S',
    false
  ),
  (
    10015,
    'oliver_crypto',
    'Oliver Olsson',
    'V240S',
    false
  ),
  -- V250S class
  (
    10016,
    'paula_web',
    'Paula Peterson',
    'V250S',
    false
  ),
  (
    10017,
    'quinn_misc',
    'Quinn Quist',
    'V250S',
    false
  ),
  (
    10018,
    'rachel_pwn',
    'Rachel Rodriguez',
    'V250S',
    false
  ),
  (
    10019,
    'steve_intro',
    'Steve Svensson',
    'V250S',
    false
  ),
  -- No Class
  (
    10020,
    'tina_expert',
    'Tina Taylor',
    'No Class',
    false
  ),
  (
    10021,
    'uma_ninja',
    'Uma Underwood',
    'No Class',
    false
  ),
  (
    10022,
    'victor_admin',
    'Victor Vega',
    'No Class',
    true
  ),
  (
    10023,
    'wendy_hacker',
    'Wendy White',
    'No Class',
    false
  ),
  (
    10024,
    'xander_pro',
    'Xander Xavier',
    'No Class',
    true
  ),
  (
    10025,
    'yuki_master',
    'Yuki Yamamoto',
    'No Class',
    false
  );

-- ============================================================================
-- 4. CTF ORGANIZERS (assign organizers to events)
-- Note: Organizers cannot be members of teams in their CTF
-- ============================================================================
INSERT INTO
  ctf_organizers (user_id, ctf)
SELECT
  id,
  1
FROM
  users
WHERE
  github_username IN ('victor_admin', 'hannah_misc');

INSERT INTO
  ctf_organizers (user_id, ctf)
SELECT
  id,
  2
FROM
  users
WHERE
  github_username IN ('xander_pro', 'hannah_misc');

INSERT INTO
  ctf_organizers (user_id, ctf)
SELECT
  id,
  3
FROM
  users
WHERE
  github_username IN ('victor_admin', 'xander_pro');

INSERT INTO
  ctf_organizers (user_id, ctf)
SELECT
  id,
  4
FROM
  users
WHERE
  github_username IN ('hannah_misc', 'victor_admin');

INSERT INTO
  ctf_organizers (user_id, ctf)
SELECT
  id,
  5
FROM
  users
WHERE
  github_username IN ('xander_pro', 'hannah_misc', 'victor_admin');

INSERT INTO
  ctf_organizers (user_id, ctf)
SELECT
  id,
  6
FROM
  users
WHERE
  github_username = 'victor_admin';

INSERT INTO
  ctf_organizers (user_id, ctf)
SELECT
  id,
  7
FROM
  users
WHERE
  github_username IN ('hannah_misc', 'xander_pro');

-- ============================================================================
-- 5. CTF CHALLENGES (CTF-specific challenges in ctf_challenges table)
-- ============================================================================
INSERT INTO
  ctf_challenges (
    challenge_id,
    points,
    display_name,
    description,
    challenge_category,
    challenge_sub_categories,
    flag,
    ctf,
    author,
    anonymous_author,
    approved,
    created_at,
    migrate_to_wargames
  )
VALUES
  -- CTF 1 challenges (Winter Warmup)
  (
    'winter_intro_01',
    50,
    'Welcome to Winter CTF',
    'Read the rules and find the flag',
    'introduction',
    '00100000',
    1,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'alice_sec'
    ),
    false,
    true,
    now() - interval '10 months',
    true
  ),
  (
    'winter_crypto_01',
    100,
    'Caesar Cipher',
    'Decode this ancient encryption method',
    'crypto',
    '10000000',
    2,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'bob_crypto'
    ),
    false,
    true,
    now() - interval '10 months',
    true
  ),
  (
    'winter_web_01',
    150,
    'SQL Injection Basics',
    'Bypass the authentication system',
    'web',
    '00000001',
    8,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'charlie_web'
    ),
    false,
    true,
    now() - interval '10 months',
    true
  ),
  (
    'winter_forensics_01',
    200,
    'Hidden in Plain Sight',
    'Extract the hidden data from the image',
    'forensics',
    '01000000',
    3,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'fiona_forensics'
    ),
    false,
    true,
    now() - interval '10 months',
    true
  ),
  (
    'winter_pwn_01',
    250,
    'Stack Overflow',
    'Exploit the buffer overflow vulnerability',
    'pwn',
    '00000100',
    6,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'diana_pwn'
    ),
    true,
    true,
    now() - interval '10 months',
    true
  ),
  -- CTF 2 challenges (Spring Security)
  (
    'spring_intro_01',
    50,
    'Spring Start',
    'Begin your spring security journey',
    'introduction',
    '00100000',
    11,
    2,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'alice_sec'
    ),
    false,
    true,
    now() - interval '7 months',
    true
  ),
  (
    'spring_crypto_01',
    120,
    'XOR Encryption',
    'Break the XOR cipher',
    'crypto',
    '10000000',
    9,
    2,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'ivan_crypto'
    ),
    false,
    true,
    now() - interval '7 months',
    true
  ),
  (
    'spring_osint_01',
    100,
    'Social Media Tracker',
    'Find the person based on their posts',
    'osint',
    '00001000',
    5,
    2,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'george_osint'
    ),
    false,
    true,
    now() - interval '7 months',
    true
  ),
  (
    'spring_rev_01',
    300,
    'Reverse the Binary',
    'Understand what this program does',
    'reversing',
    '00000010',
    7,
    2,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'erik_rev'
    ),
    false,
    true,
    now() - interval '7 months',
    true
  ),
  (
    'spring_forensics_01',
    180,
    'Memory Analysis',
    'Analyze the memory dump to find secrets',
    'forensics',
    '01000000',
    10,
    2,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'mike_forensics'
    ),
    false,
    true,
    now() - interval '7 months',
    true
  ),
  -- CTF 3 challenges (Summer Hacking)
  (
    'summer_intro_01',
    50,
    'Summer Kickoff',
    'Get ready for the summer hacking festival',
    'introduction',
    '00100000',
    19,
    3,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'alice_sec'
    ),
    false,
    true,
    now() - interval '4 months',
    true
  ),
  (
    'summer_web_01',
    150,
    'XSS Challenge',
    'Find and exploit the cross-site scripting vulnerability',
    'web',
    '00000001',
    16,
    3,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'julia_web'
    ),
    false,
    true,
    now() - interval '4 months',
    true
  ),
  (
    'summer_crypto_01',
    200,
    'RSA Weak Keys',
    'Factor the weak RSA modulus',
    'crypto',
    '10000000',
    17,
    3,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'oliver_crypto'
    ),
    false,
    true,
    now() - interval '4 months',
    true
  ),
  (
    'summer_pwn_01',
    280,
    'Heap Overflow',
    'Exploit the heap memory management',
    'pwn',
    '00000100',
    14,
    3,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'kevin_pwn'
    ),
    false,
    true,
    now() - interval '4 months',
    true
  ),
  (
    'summer_misc_01',
    120,
    'Network Analysis',
    'Analyze the PCAP file',
    'misc',
    '00010000',
    12,
    3,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'quinn_misc'
    ),
    false,
    true,
    now() - interval '4 months',
    true
  ),
  -- CTF 4 challenges (Autumn Attack)
  (
    'fall_intro_01',
    50,
    'Autumn Adventure',
    'Start your autumn attack challenge',
    'introduction',
    '00100000',
    27,
    4,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'steve_intro'
    ),
    false,
    true,
    now() - interval '2 months',
    true
  ),
  (
    'fall_osint_01',
    150,
    'Geolocation Master',
    'Find the exact location from the photo',
    'osint',
    '00001000',
    21,
    4,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'nina_osint'
    ),
    false,
    true,
    now() - interval '2 months',
    true
  ),
  (
    'fall_web_01',
    180,
    'JWT Forgery',
    'Forge a valid JWT token',
    'web',
    '00000001',
    24,
    4,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'paula_web'
    ),
    false,
    true,
    now() - interval '2 months',
    true
  ),
  (
    'fall_forensics_01',
    200,
    'PCAP Deep Dive',
    'Extract the secret from network traffic',
    'forensics',
    '01000000',
    18,
    4,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'fiona_forensics'
    ),
    false,
    true,
    now() - interval '2 months',
    true
  ),
  (
    'fall_rev_01',
    320,
    'Assembly Challenge',
    'Reverse engineer the assembly code',
    'reversing',
    '00000010',
    23,
    4,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'laura_rev'
    ),
    false,
    true,
    now() - interval '2 months',
    true
  ),
  -- CTF 5 challenges (Ongoing - December Cyber Showdown)
  (
    'current_intro_01',
    50,
    'December Welcome',
    'Join the December Cyber Showdown',
    'introduction',
    '00100000',
    11,
    5,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'alice_sec'
    ),
    false,
    true,
    now() - interval '1 week',
    true
  ),
  (
    'current_crypto_01',
    150,
    'AES Challenge',
    'Decrypt the AES encrypted message',
    'crypto',
    '10000000',
    25,
    5,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'bob_crypto'
    ),
    false,
    true,
    now() - interval '1 week',
    true
  ),
  (
    'current_pwn_01',
    300,
    'Format String Exploit',
    'Exploit the format string vulnerability',
    'pwn',
    '00000100',
    22,
    5,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'rachel_pwn'
    ),
    false,
    true,
    now() - interval '1 week',
    true
  ),
  (
    'current_forensics_01',
    220,
    'Disk Image Recovery',
    'Recover deleted files from the disk image',
    'forensics',
    '01000000',
    26,
    5,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'mike_forensics'
    ),
    false,
    true,
    now() - interval '1 week',
    true
  ),
  (
    'current_misc_01',
    130,
    'Zip Password',
    'Crack the zip file password',
    'misc',
    '00010000',
    28,
    5,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'quinn_misc'
    ),
    false,
    true,
    now() - interval '1 week',
    true
  ),
  -- CTF 6 challenges (Future - New Year CTF)
  (
    'newyear_intro_01',
    50,
    'New Year New Challenges',
    'Start 2026 with cybersecurity',
    'introduction',
    '00100000',
    1,
    6,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'alice_sec'
    ),
    false,
    true,
    now() - interval '2 days',
    true
  ),
  (
    'newyear_web_01',
    160,
    'API Security',
    'Find vulnerabilities in the REST API',
    'web',
    '00000001',
    8,
    6,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'charlie_web'
    ),
    false,
    true,
    now() - interval '2 days',
    true
  ),
  (
    'newyear_osint_01',
    140,
    'Metadata Hunter',
    'Extract information from file metadata',
    'osint',
    '00001000',
    29,
    6,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'george_osint'
    ),
    false,
    true,
    now() - interval '2 days',
    true
  );

-- ============================================================================
-- 6. WARGAME CHALLENGES (permanent challenges in challenges table)
-- ============================================================================
INSERT INTO
  challenges (
    challenge_id,
    points,
    display_name,
    description,
    challenge_category,
    challenge_sub_categories,
    flag,
    ctf,
    author,
    anonymous_author,
    approved,
    created_at,
    migrate_to_wargames
  )
VALUES
  -- Challenges migrated from past CTFs (have ctf reference)
  (
    'wargame_intro_01',
    25,
    'Wargame Introduction',
    'Learn the basics of wargames',
    'introduction',
    '00100000',
    19,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'xander_pro'
    ),
    false,
    true,
    now() - interval '6 months',
    true
  ),
  (
    'wargame_crypto_01',
    100,
    'Classic Crypto',
    'Solve classic cryptography challenges',
    'crypto',
    '10000000',
    2,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'ivan_crypto'
    ),
    false,
    true,
    now() - interval '5 months',
    true
  ),
  (
    'wargame_pwn_01',
    200,
    'Binary Exploitation 101',
    'Learn basic binary exploitation',
    'pwn',
    '00000100',
    6,
    2,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'diana_pwn'
    ),
    false,
    true,
    now() - interval '4 months',
    true
  ),
  (
    'wargame_web_01',
    120,
    'Web Security Fundamentals',
    'Master web application security',
    'web',
    '00000001',
    8,
    2,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'julia_web'
    ),
    false,
    true,
    now() - interval '3 months',
    true
  ),
  (
    'wargame_rev_01',
    250,
    'Reverse Engineering Practice',
    'Practice your reversing skills',
    'reversing',
    '00000010',
    15,
    3,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'erik_rev'
    ),
    false,
    true,
    now() - interval '2 months',
    true
  ),
  (
    'wargame_forensics_01',
    180,
    'Digital Forensics Lab',
    'Analyze various forensic artifacts',
    'forensics',
    '01000000',
    4,
    3,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'fiona_forensics'
    ),
    false,
    true,
    now() - interval '1 month',
    true
  ),
  -- Original wargame challenge (no CTF origin)
  (
    'wargame_pwn_02',
    350,
    'Advanced Shellcode',
    'Write and execute shellcode',
    'pwn',
    '00000100',
    30,
    NULL,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'kevin_pwn'
    ),
    false,
    true,
    now() - interval '2 weeks',
    true
  ),
  -- Challenge that won't migrate to wargames (for testing)
  (
    'private_challenge_01',
    100,
    'Private CTF Challenge',
    'This challenge will not be shown as a wargame',
    'misc',
    '00010000',
    20,
    1,
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'victor_admin'
    ),
    false,
    true,
    now() - interval '6 months',
    false
  );

-- Ensure private CTF challenge also exists in ctf_challenges
INSERT INTO
  ctf_challenges (
    slug,
    points,
    title,
    description,
    category,
    tags,
    solves,
    ctf,
    author,
    is_hidden,
    is_active,
    created_at,
    show_in_wargames
  )
SELECT
  slug,
  points,
  title,
  description,
  category,
  tags,
  solves,
  ctf,
  author,
  is_hidden,
  is_active,
  created_at,
  show_in_wargames
FROM
  challenges
WHERE
  slug = 'private_challenge_01';

-- ============================================================================
-- 7. CTF CHALLENGE RESOURCES (for CTF challenges)
-- ============================================================================
INSERT INTO
  ctf_challenge_resources (challenge, type, content)
VALUES
  -- Winter CTF resources
  ('winter_crypto_01', 'file', 'caesar_cipher.txt'),
  (
    'winter_web_01',
    'web',
    'https://winter-ctf.example.com/login'
  ),
  ('winter_forensics_01', 'file', 'hidden_image.png'),
  ('winter_pwn_01', 'file', 'vuln_binary'),
  (
    'winter_pwn_01',
    'cmd',
    'nc winter-ctf.example.com 9001'
  ),
  -- Spring CTF resources
  ('spring_crypto_01', 'file', 'xor_encrypted.bin'),
  (
    'spring_osint_01',
    'web',
    'https://twitter.com/mystery_user_2025'
  ),
  ('spring_rev_01', 'file', 'reverse_me.exe'),
  ('spring_forensics_01', 'file', 'memory_dump.raw'),
  -- Summer CTF resources
  (
    'summer_web_01',
    'web',
    'https://summer-ctf.example.com/vulnerable-app'
  ),
  ('summer_crypto_01', 'file', 'weak_rsa.txt'),
  ('summer_pwn_01', 'file', 'heap_challenge'),
  (
    'summer_pwn_01',
    'cmd',
    'nc summer-ctf.example.com 8888'
  ),
  ('summer_misc_01', 'file', 'network_capture.pcap'),
  -- Fall CTF resources
  ('fall_osint_01', 'file', 'mystery_location.jpg'),
  (
    'fall_web_01',
    'web',
    'https://fall-ctf.example.com/jwt-app'
  ),
  (
    'fall_forensics_01',
    'file',
    'network_traffic.pcapng'
  ),
  ('fall_rev_01', 'file', 'assembly_challenge.elf'),
  -- Current CTF resources
  ('current_crypto_01', 'file', 'aes_encrypted.bin'),
  (
    'current_pwn_01',
    'cmd',
    'nc current-ctf.example.com 7777'
  ),
  ('current_forensics_01', 'file', 'disk_image.dd'),
  (
    'current_misc_01',
    'file',
    'encrypted_archive.zip'
  ),
  -- Future CTF resources
  (
    'newyear_web_01',
    'web',
    'https://newyear-ctf.example.com/api'
  ),
  ('newyear_osint_01', 'file', 'document.pdf');

-- ============================================================================
-- 8. WARGAME CHALLENGE RESOURCES (for permanent wargame challenges)
-- ============================================================================
INSERT INTO
  challenge_resources (challenge, type, content)
VALUES
  ('wargame_crypto_01', 'file', 'crypto1.txt'),
  (
    'wargame_pwn_01',
    'cmd',
    'nc wargames.example.com 5001'
  ),
  ('wargame_pwn_01', 'file', 'pwn1'),
  (
    'wargame_web_01',
    'web',
    'https://wargames.example.com/web1'
  ),
  ('wargame_rev_01', 'file', 'reverse1.exe'),
  ('wargame_forensics_01', 'file', 'evidence.zip'),
  (
    'wargame_pwn_02',
    'cmd',
    'nc wargames.example.com 5002'
  ),
  ('wargame_pwn_02', 'file', 'pwn2');

-- ============================================================================
-- 9. CTF TEAMS (12 teams across different CTFs)
-- ============================================================================
INSERT INTO
  ctf_teams (website, name, ctf)
VALUES
  -- Winter CTF teams (CTF 1)
  ('https://team-alpha.example.com', 'Team Alpha', 1),
  ('https://team-beta.example.com', 'Team Beta', 1),
  ('https://team-gamma.example.com', 'Team Gamma', 1),
  -- Spring CTF teams (CTF 2)
  ('https://team-delta.example.com', 'Team Delta', 2),
  (
    'https://team-epsilon.example.com',
    'Team Epsilon',
    2
  ),
  -- Summer CTF teams (CTF 3)
  ('https://team-zeta.example.com', 'Team Zeta', 3),
  ('https://team-eta.example.com', 'Team Eta', 3),
  ('https://team-theta.example.com', 'Team Theta', 3),
  -- Fall CTF teams (CTF 4)
  ('https://team-iota.example.com', 'Team Iota', 4),
  (NULL, 'Team Kappa', 4),
  -- Current CTF teams (CTF 5)
  (
    'https://team-lambda.example.com',
    'Team Lambda',
    5
  ),
  ('https://team-mu.example.com', 'Team Mu', 5);

-- ============================================================================
-- 10. TEAM MEMBERSHIPS
-- Note: Users who are organizers for a CTF cannot be in teams for that CTF
-- ============================================================================
-- Team Alpha (Winter CTF - ID 1)
-- Organizers for CTF 1: victor_admin, hannah_misc - excluded
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  1
FROM
  users
WHERE
  github_username IN (
    'alice_sec',
    'bob_crypto',
    'charlie_web',
    'diana_pwn'
  );

-- Team Beta (Winter CTF - ID 2)
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  2
FROM
  users
WHERE
  github_username IN ('erik_rev', 'fiona_forensics', 'george_osint');

-- Team Gamma (Winter CTF - ID 3)
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  3
FROM
  users
WHERE
  github_username IN ('ivan_crypto', 'julia_web', 'kevin_pwn');

-- Team Delta (Spring CTF - ID 4)
-- Organizers for CTF 2: xander_pro, hannah_misc - excluded
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  4
FROM
  users
WHERE
  github_username IN (
    'laura_rev',
    'mike_forensics',
    'nina_osint',
    'oliver_crypto',
    'paula_web'
  );

-- Team Epsilon (Spring CTF - ID 5)
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  5
FROM
  users
WHERE
  github_username IN ('quinn_misc', 'rachel_pwn', 'steve_intro');

-- Team Zeta (Summer CTF - ID 6)
-- Organizers for CTF 3: victor_admin, xander_pro - excluded
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  6
FROM
  users
WHERE
  github_username IN (
    'tina_expert',
    'uma_ninja',
    'wendy_hacker',
    'yuki_master'
  );

-- Team Eta (Summer CTF - ID 7)
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  7
FROM
  users
WHERE
  github_username IN (
    'alice_sec',
    'bob_crypto',
    'charlie_web',
    'diana_pwn'
  );

-- Team Theta (Summer CTF - ID 8)
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  8
FROM
  users
WHERE
  github_username IN (
    'fiona_forensics',
    'george_osint',
    'hannah_misc',
    'ivan_crypto',
    'julia_web',
    'kevin_pwn'
  );

-- Team Iota (Fall CTF - ID 9)
-- Organizers for CTF 4: hannah_misc, victor_admin - excluded
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  9
FROM
  users
WHERE
  github_username IN (
    'laura_rev',
    'mike_forensics',
    'nina_osint',
    'oliver_crypto'
  );

-- Team Kappa (Fall CTF - ID 10)
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  10
FROM
  users
WHERE
  github_username IN (
    'paula_web',
    'quinn_misc',
    'rachel_pwn',
    'steve_intro'
  );

-- Team Lambda (Current CTF - ID 11)
-- Organizers for CTF 5: xander_pro, hannah_misc, victor_admin - excluded
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  11
FROM
  users
WHERE
  github_username IN (
    'tina_expert',
    'uma_ninja',
    'wendy_hacker',
    'yuki_master'
  );

-- Team Mu (Current CTF - ID 12)
INSERT INTO
  ctf_teams_members (user_id, team)
SELECT
  id,
  12
FROM
  users
WHERE
  github_username IN (
    'alice_sec',
    'bob_crypto',
    'charlie_web',
    'diana_pwn',
    'erik_rev'
  );

-- ============================================================================
-- 11. CTF SUBMISSIONS (using team_id instead of user_id)
-- ============================================================================
-- Winter CTF submissions (past event)
INSERT INTO
  ctf_submissions (
    challenge,
    team_id,
    time,
    success,
    ctf,
    submitted_data
  )
VALUES
  -- Team Alpha (ID 1) submissions
  (
    'winter_intro_01',
    1,
    now() - interval '10 months' + interval '15 minutes',
    true,
    1,
    'FLAG{welcome_to_ctf}'
  ),
  (
    'winter_crypto_01',
    1,
    now() - interval '10 months' + interval '1 hour',
    true,
    1,
    'FLAG{basic_crypto_rocks}'
  ),
  (
    'winter_web_01',
    1,
    now() - interval '10 months' + interval '1 hour 30 minutes',
    false,
    1,
    'FLAG{wrong_guess}'
  ),
  (
    'winter_web_01',
    1,
    now() - interval '10 months' + interval '2 hours',
    true,
    1,
    'FLAG{sql_injection_success}'
  ),
  (
    'winter_forensics_01',
    1,
    now() - interval '10 months' + interval '3 hours',
    true,
    1,
    'FLAG{find_the_hidden_file}'
  ),
  (
    'winter_pwn_01',
    1,
    now() - interval '10 months' + interval '8 hours',
    true,
    1,
    'FLAG{buffer_overflow_pwned}'
  ),
  -- Team Beta (ID 2) submissions
  (
    'winter_intro_01',
    2,
    now() - interval '10 months' + interval '20 minutes',
    true,
    1,
    'FLAG{welcome_to_ctf}'
  ),
  (
    'winter_crypto_01',
    2,
    now() - interval '10 months' + interval '2 hours',
    false,
    1,
    'wrong_flag'
  ),
  (
    'winter_forensics_01',
    2,
    now() - interval '10 months' + interval '2 hours 30 minutes',
    true,
    1,
    'FLAG{find_the_hidden_file}'
  ),
  (
    'winter_crypto_01',
    2,
    now() - interval '10 months' + interval '3 hours',
    true,
    1,
    'FLAG{basic_crypto_rocks}'
  ),
  -- Team Gamma (ID 3) submissions
  (
    'winter_web_01',
    3,
    now() - interval '10 months' + interval '2 hours 15 minutes',
    true,
    1,
    'FLAG{sql_injection_success}'
  ),
  (
    'winter_pwn_01',
    3,
    now() - interval '10 months' + interval '10 hours',
    false,
    1,
    'attempted_exploit'
  );

-- Spring CTF submissions
INSERT INTO
  ctf_submissions (
    challenge,
    team_id,
    time,
    success,
    ctf,
    submitted_data
  )
VALUES
  -- Team Delta (ID 4) submissions
  (
    'spring_intro_01',
    4,
    now() - interval '7 months' + interval '30 minutes',
    true,
    2,
    'FLAG{first_steps_completed}'
  ),
  (
    'spring_crypto_01',
    4,
    now() - interval '7 months' + interval '2 hours',
    true,
    2,
    'FLAG{xor_cipher_decoded}'
  ),
  (
    'spring_osint_01',
    4,
    now() - interval '7 months' + interval '1 hour 30 minutes',
    true,
    2,
    'FLAG{osint_detective_level1}'
  ),
  (
    'spring_rev_01',
    4,
    now() - interval '7 months' + interval '12 hours',
    true,
    2,
    'FLAG{reverse_engineering_101}'
  ),
  (
    'spring_forensics_01',
    4,
    now() - interval '7 months' + interval '5 hours',
    true,
    2,
    'FLAG{memory_dump_analyzed}'
  ),
  -- Team Epsilon (ID 5) submissions
  (
    'spring_crypto_01',
    5,
    now() - interval '7 months' + interval '3 hours',
    false,
    2,
    'wrong_xor_key'
  ),
  (
    'spring_osint_01',
    5,
    now() - interval '7 months' + interval '2 hours',
    false,
    2,
    'incorrect_person'
  );

-- Summer CTF submissions
INSERT INTO
  ctf_submissions (
    challenge,
    team_id,
    time,
    success,
    ctf,
    submitted_data
  )
VALUES
  -- Team Zeta (ID 6) submissions
  (
    'summer_intro_01',
    6,
    now() - interval '4 months' + interval '5 minutes',
    true,
    3,
    'FLAG{getting_started}'
  ),
  (
    'summer_web_01',
    6,
    now() - interval '4 months' + interval '1 hour',
    true,
    3,
    'FLAG{xss_vulnerability_found}'
  ),
  (
    'summer_misc_01',
    6,
    now() - interval '4 months' + interval '4 hours',
    true,
    3,
    'FLAG{network_forensics_win}'
  ),
  -- Team Eta (ID 7) submissions
  (
    'summer_web_01',
    7,
    now() - interval '4 months' + interval '1 hour 30 minutes',
    true,
    3,
    'FLAG{xss_vulnerability_found}'
  ),
  (
    'summer_crypto_01',
    7,
    now() - interval '4 months' + interval '6 hours',
    true,
    3,
    'FLAG{rsa_broken}'
  ),
  (
    'summer_crypto_01',
    7,
    now() - interval '4 months' + interval '5 hours',
    false,
    3,
    'incorrect_factorization'
  ),
  -- Team Theta (ID 8) submissions
  (
    'summer_pwn_01',
    8,
    now() - interval '4 months' + interval '15 hours',
    true,
    3,
    'FLAG{heap_exploitation_master}'
  ),
  (
    'summer_pwn_01',
    8,
    now() - interval '4 months' + interval '14 hours',
    false,
    3,
    'heap_attempt_failed'
  );

-- Fall CTF submissions
INSERT INTO
  ctf_submissions (
    challenge,
    team_id,
    time,
    success,
    ctf,
    submitted_data
  )
VALUES
  -- Team Iota (ID 9) submissions
  (
    'fall_intro_01',
    9,
    now() - interval '2 months' + interval '10 minutes',
    true,
    4,
    'FLAG{beginner_champion}'
  ),
  (
    'fall_osint_01',
    9,
    now() - interval '2 months' + interval '2 hours',
    true,
    4,
    'FLAG{geolocation_expert}'
  ),
  (
    'fall_forensics_01',
    9,
    now() - interval '2 months' + interval '6 hours',
    true,
    4,
    'FLAG{pcap_analysis_expert}'
  ),
  (
    'fall_rev_01',
    9,
    now() - interval '2 months' + interval '18 hours',
    true,
    4,
    'FLAG{assembly_decoded}'
  ),
  -- Team Kappa (ID 10) submissions
  (
    'fall_web_01',
    10,
    now() - interval '2 months' + interval '3 hours',
    true,
    4,
    'FLAG{jwt_token_forged}'
  ),
  (
    'fall_osint_01',
    10,
    now() - interval '2 months' + interval '2 hours 30 minutes',
    false,
    4,
    'wrong_location'
  ),
  (
    'fall_web_01',
    10,
    now() - interval '2 months' + interval '4 hours',
    false,
    4,
    'invalid_jwt'
  );

-- Current CTF submissions (ongoing)
INSERT INTO
  ctf_submissions (
    challenge,
    team_id,
    time,
    success,
    ctf,
    submitted_data
  )
VALUES
  -- Team Lambda (ID 11) submissions
  (
    'current_intro_01',
    11,
    now() - interval '50 minutes',
    true,
    5,
    'FLAG{first_steps_completed}'
  ),
  (
    'current_crypto_01',
    11,
    now() - interval '45 minutes',
    false,
    5,
    'wrong_aes_key'
  ),
  (
    'current_misc_01',
    11,
    now() - interval '20 minutes',
    true,
    5,
    'FLAG{zip_password_cracked}'
  ),
  -- Team Mu (ID 12) submissions
  (
    'current_intro_01',
    12,
    now() - interval '1 hour',
    true,
    5,
    'FLAG{first_steps_completed}'
  ),
  (
    'current_crypto_01',
    12,
    now() - interval '30 minutes',
    true,
    5,
    'FLAG{aes_decrypted}'
  ),
  (
    'current_pwn_01',
    12,
    now() - interval '15 minutes',
    false,
    5,
    'format_string_attempt'
  );

-- ============================================================================
-- 12. WARGAME SUBMISSIONS
-- ============================================================================
INSERT INTO
  wargame_submissions (challenge, user_id, time, success, submitted_data)
VALUES
  -- Recent wargame activity
  (
    'wargame_intro_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'steve_intro'
    ),
    now() - interval '2 days',
    true,
    'FLAG{getting_started}'
  ),
  (
    'wargame_crypto_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'ivan_crypto'
    ),
    now() - interval '5 days',
    true,
    'FLAG{basic_crypto_rocks}'
  ),
  (
    'wargame_pwn_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'rachel_pwn'
    ),
    now() - interval '1 week',
    true,
    'FLAG{buffer_overflow_pwned}'
  ),
  (
    'wargame_web_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'julia_web'
    ),
    now() - interval '10 days',
    true,
    'FLAG{sql_injection_success}'
  ),
  (
    'wargame_rev_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'erik_rev'
    ),
    now() - interval '2 weeks',
    true,
    'FLAG{obfuscated_code_cracked}'
  ),
  (
    'wargame_forensics_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'fiona_forensics'
    ),
    now() - interval '3 weeks',
    true,
    'FLAG{steganography_master}'
  ),
  (
    'wargame_pwn_02',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'kevin_pwn'
    ),
    now() - interval '1 day',
    true,
    'FLAG{shellcode_executed}'
  ),
  -- Failed attempts
  (
    'wargame_crypto_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'alice_sec'
    ),
    now() - interval '3 days',
    false,
    'incorrect_decode'
  ),
  (
    'wargame_pwn_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'diana_pwn'
    ),
    now() - interval '1 week',
    false,
    'exploit_failed'
  ),
  (
    'wargame_rev_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'laura_rev'
    ),
    now() - interval '4 days',
    false,
    'wrong_analysis'
  ),
  (
    'wargame_web_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'charlie_web'
    ),
    now() - interval '6 days',
    false,
    'sqli_blocked'
  ),
  (
    'wargame_pwn_02',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'diana_pwn'
    ),
    now() - interval '2 days',
    false,
    'shellcode_crash'
  ),
  -- Older activity
  (
    'wargame_intro_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'yuki_master'
    ),
    now() - interval '1 month',
    true,
    'FLAG{getting_started}'
  ),
  (
    'wargame_crypto_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'oliver_crypto'
    ),
    now() - interval '1 month',
    true,
    'FLAG{basic_crypto_rocks}'
  ),
  (
    'wargame_web_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'paula_web'
    ),
    now() - interval '2 months',
    true,
    'FLAG{sql_injection_success}'
  ),
  (
    'wargame_pwn_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'kevin_pwn'
    ),
    now() - interval '3 months',
    true,
    'FLAG{buffer_overflow_pwned}'
  ),
  (
    'wargame_forensics_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'mike_forensics'
    ),
    now() - interval '2 months',
    true,
    'FLAG{steganography_master}'
  ),
  (
    'wargame_rev_01',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'laura_rev'
    ),
    now() - interval '6 weeks',
    true,
    'FLAG{obfuscated_code_cracked}'
  );

-- ============================================================================
-- 13. USER SESSIONS
-- ============================================================================
INSERT INTO
  user_sessions (id, user_id, expires_at)
VALUES
  -- Active sessions (expire in future)
  (
    'session_alice_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'alice_sec'
    ),
    now() + interval '7 days'
  ),
  (
    'session_bob_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'bob_crypto'
    ),
    now() + interval '6 days'
  ),
  (
    'session_charlie_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'charlie_web'
    ),
    now() + interval '5 days'
  ),
  (
    'session_diana_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'diana_pwn'
    ),
    now() + interval '4 days'
  ),
  (
    'session_hannah_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'hannah_misc'
    ),
    now() + interval '10 days'
  ),
  (
    'session_victor_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'victor_admin'
    ),
    now() + interval '14 days'
  ),
  (
    'session_xander_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'xander_pro'
    ),
    now() + interval '12 days'
  ),
  (
    'session_tina_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'tina_expert'
    ),
    now() + interval '3 days'
  ),
  (
    'session_wendy_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'wendy_hacker'
    ),
    now() + interval '2 days'
  ),
  (
    'session_yuki_active',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'yuki_master'
    ),
    now() + interval '8 days'
  ),
  -- Expired sessions (for testing cleanup)
  (
    'session_erik_expired',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'erik_rev'
    ),
    now() - interval '1 day'
  ),
  (
    'session_fiona_expired',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'fiona_forensics'
    ),
    now() - interval '2 days'
  ),
  (
    'session_george_expired',
    (
      SELECT
        id
      FROM
        users
      WHERE
        github_username = 'george_osint'
    ),
    now() - interval '3 days'
  );

COMMIT;
