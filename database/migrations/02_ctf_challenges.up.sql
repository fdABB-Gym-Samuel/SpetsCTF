BEGIN;

-- Create the ctf_challenges table for CTF-specific challenges
CREATE TABLE IF NOT EXISTS ctf_challenges (
  challenge_id VARCHAR(256) PRIMARY KEY,
  points INT NOT NULL,
  display_name VARCHAR(256) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ,
  challenge_category CATEGORY DEFAULT 'misc' NOT NULL,
  -- This is basically a bitset storing the challenges
  -- The challenges are stored in an array, order matters!!! Its the same as the Enum for category, i.e alphabetical
  -- The list of challenges can be derived like this in js:
  --
  -- categories.filter((_, index) => (challenge_data.challenge_sub_categories.split("").reverse().join("")[index] === "1")) as category}
  --
  -- Where categories is the aforementioned array 
  challenge_sub_categories BIT(8) NOT NULL,
  flag INT NOT NULL,
  ctf INT NOT NULL,
  author UUID,
  anonymous_author BOOLEAN,
  approved BOOLEAN,
  migrate_to_wargames BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (flag) REFERENCES flag (id),
  FOREIGN KEY (ctf) REFERENCES ctf_events (id) ON DELETE CASCADE,
  FOREIGN KEY (author) REFERENCES users (id)
);

-- Migrate challenges that belong to a CTF into the ctf_challenges table
-- Create separate flags for ctf_challenges (so they're independent from wargame flags)
-- Use a DO block with a loop since INSERT in LATERAL is not allowed in PostgreSQL
DO $$
DECLARE
  challenge_record RECORD;
  new_flag_id INT;
BEGIN
  FOR challenge_record IN
    SELECT c.challenge_id, c.points, c.display_name, c.description, c.created_at,
           c.challenge_category, c.challenge_sub_categories, c.ctf, c.author,
           c.anonymous_author, c.approved, f.flag as flag_value, f.flag_format
    FROM challenges c
    INNER JOIN flag f ON f.id = c.flag
    WHERE c.ctf IS NOT NULL
  LOOP
    -- Insert new flag and get its ID
    INSERT INTO flag (flag, flag_format)
    VALUES (challenge_record.flag_value, challenge_record.flag_format)
    RETURNING id INTO new_flag_id;

    -- Insert into ctf_challenges with the new flag
    INSERT INTO ctf_challenges (
      challenge_id, points, display_name, description, created_at,
      challenge_category, challenge_sub_categories, flag, ctf, author,
      anonymous_author, approved, migrate_to_wargames
    ) VALUES (
      challenge_record.challenge_id, challenge_record.points, challenge_record.display_name,
      challenge_record.description, challenge_record.created_at, challenge_record.challenge_category,
      challenge_record.challenge_sub_categories, new_flag_id, challenge_record.ctf,
      challenge_record.author, challenge_record.anonymous_author, challenge_record.approved, TRUE
    );
  END LOOP;
END;
$$;

-- Challenges remain in both tables:
-- - ctf_challenges: used during active CTF competitions (with separate flags)
-- - challenges: permanent wargame versions (ctf column tracks origin, original flags)
-- Add migrate_to_wargames column to challenges table
ALTER TABLE challenges
ADD COLUMN migrate_to_wargames BOOLEAN NOT NULL DEFAULT TRUE;

-- Create ctf_challenge_resources table for CTF-specific resources
CREATE TABLE IF NOT EXISTS ctf_challenge_resources (
  id SERIAL PRIMARY KEY,
  challenge VARCHAR(256) NOT NULL,
  type CHALLENGE_RESOURCE_TYPE NOT NULL DEFAULT 'file',
  content TEXT NOT NULL,
  FOREIGN KEY (challenge) REFERENCES ctf_challenges (challenge_id) ON DELETE CASCADE,
  UNIQUE (challenge, type, content)
);

-- Migrate challenge resources that belong to CTF challenges
INSERT INTO
  ctf_challenge_resources (challenge, type, content)
SELECT
  cr.challenge,
  cr.type,
  cr.content
FROM
  challenge_resources cr
  INNER JOIN ctf_challenges cc ON cr.challenge = cc.challenge_id;

-- Delete the migrated resources from the original table
DELETE FROM challenge_resources
WHERE
  challenge IN (
    SELECT
      challenge_id
    FROM
      ctf_challenges
  );

-- Alter ctf_submissions to use team_id instead of user_id
-- First, add team_id as nullable
ALTER TABLE ctf_submissions
ADD COLUMN team_id INT REFERENCES ctf_teams (id) ON DELETE CASCADE;

-- Migrate existing submissions: find the team each user belongs to for that CTF
UPDATE ctf_submissions cs
SET
  team_id = ctm.team
FROM
  ctf_teams_members ctm
  INNER JOIN ctf_teams ct ON ctm.team = ct.id
WHERE
  cs.user_id = ctm.user_id
  AND cs.ctf = ct.ctf;

-- Delete any submissions where we couldn't find a matching team
-- (user submitted but wasn't part of a team for that CTF)
DELETE FROM ctf_submissions
WHERE
  team_id IS NULL;

-- Now make team_id NOT NULL
ALTER TABLE ctf_submissions
ALTER COLUMN team_id
SET NOT NULL;

-- Drop the old user_id column and its constraint
ALTER TABLE ctf_submissions
DROP CONSTRAINT ctf_submissions_user_id_fkey;

ALTER TABLE ctf_submissions
DROP COLUMN user_id;

-- Update the foreign key for challenge to point to ctf_challenges instead
ALTER TABLE ctf_submissions
DROP CONSTRAINT ctf_submissions_challenge_fkey;

ALTER TABLE ctf_submissions
ADD CONSTRAINT ctf_submissions_challenge_fkey FOREIGN KEY (challenge) REFERENCES ctf_challenges (challenge_id) ON DELETE CASCADE;

-- Create a function to check if a user is an organizer for a CTF
CREATE OR REPLACE FUNCTION check_organizer_not_in_team () RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user being added to a team is an organizer for that team's CTF
    IF EXISTS (
        SELECT 1 FROM ctf_organizers co
        INNER JOIN ctf_teams ct ON co.ctf = ct.ctf
        WHERE co.user_id = NEW.user_id AND ct.id = NEW.team
    ) THEN
        RAISE EXCEPTION 'User is an organizer for this CTF and cannot join a team';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent organizers from joining teams
CREATE TRIGGER prevent_organizer_in_team BEFORE INSERT
OR
UPDATE ON ctf_teams_members FOR EACH ROW
EXECUTE FUNCTION check_organizer_not_in_team ();

-- Create a function to check if a user is already in a team for a CTF
CREATE OR REPLACE FUNCTION check_team_member_not_organizer () RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user being added as organizer is already in a team for that CTF
    IF EXISTS (
        SELECT 1 FROM ctf_teams_members ctm
        INNER JOIN ctf_teams ct ON ctm.team = ct.id
        WHERE ctm.user_id = NEW.user_id AND ct.ctf = NEW.ctf
    ) THEN
        RAISE EXCEPTION 'User is already in a team for this CTF and cannot be an organizer';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent team members from becoming organizers
CREATE TRIGGER prevent_team_member_as_organizer BEFORE INSERT
OR
UPDATE ON ctf_organizers FOR EACH ROW
EXECUTE FUNCTION check_team_member_not_organizer ();

-- Remove existing organizers from teams for CTFs they organize
DELETE FROM ctf_teams_members
WHERE
  (user_id, team) IN (
    SELECT
      ctm.user_id,
      ctm.team
    FROM
      ctf_teams_members ctm
      INNER JOIN ctf_teams ct ON ctm.team = ct.id
      INNER JOIN ctf_organizers co ON co.user_id = ctm.user_id
      AND co.ctf = ct.ctf
  );

COMMIT;
