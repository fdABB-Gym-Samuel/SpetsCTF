BEGIN;

-- Drop the triggers and functions for organizer/team constraints
DROP TRIGGER IF EXISTS prevent_team_member_as_organizer ON ctf_organizers;

DROP TRIGGER IF EXISTS prevent_organizer_in_team ON ctf_teams_members;

DROP FUNCTION IF EXISTS check_team_member_not_organizer ();

DROP FUNCTION IF EXISTS check_organizer_not_in_team ();

-- Re-add ctf column to challenges table
ALTER TABLE challenges
ADD COLUMN ctf INT REFERENCES ctf_events (id);

-- Migrate CTF challenges back to the challenges table
INSERT INTO
  challenges (
    challenge_id,
    points,
    display_name,
    description,
    created_at,
    challenge_category,
    challenge_sub_categories,
    flag,
    ctf,
    author,
    anonymous_author,
    approved
  )
SELECT
  challenge_id,
  points,
  display_name,
  description,
  created_at,
  challenge_category,
  challenge_sub_categories,
  flag,
  ctf,
  author,
  anonymous_author,
  approved
FROM
  ctf_challenges;

-- Restore ctf_submissions to use user_id instead of team_id
-- First, add user_id as nullable
ALTER TABLE ctf_submissions
ADD COLUMN user_id UUID REFERENCES users (id) ON DELETE CASCADE;

-- Migrate existing submissions: pick a user from the team
-- (We can only pick one user since we don't know which user originally submitted)
UPDATE ctf_submissions cs
SET
  user_id = (
    SELECT
      ctm.user_id
    FROM
      ctf_teams_members ctm
    WHERE
      ctm.team = cs.team_id
    LIMIT
      1
  );

-- Delete any submissions where we couldn't find a matching user
DELETE FROM ctf_submissions
WHERE
  user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE ctf_submissions
ALTER COLUMN user_id
SET NOT NULL;

-- Restore the foreign key for challenge to point to challenges instead of ctf_challenges
ALTER TABLE ctf_submissions
DROP CONSTRAINT ctf_submissions_challenge_fkey;

ALTER TABLE ctf_submissions
ADD CONSTRAINT ctf_submissions_challenge_fkey FOREIGN KEY (challenge) REFERENCES challenges (challenge_id) ON DELETE CASCADE;

-- Drop team_id column
ALTER TABLE ctf_submissions
DROP COLUMN team_id;

-- Migrate CTF challenge resources back to challenge_resources
INSERT INTO
  challenge_resources (challenge, type, content)
SELECT
  challenge,
  type,
  content
FROM
  ctf_challenge_resources;

-- Drop the ctf_challenge_resources table
DROP TABLE IF EXISTS ctf_challenge_resources;

-- Drop the ctf_challenges table
DROP TABLE IF EXISTS ctf_challenges;

COMMIT;
