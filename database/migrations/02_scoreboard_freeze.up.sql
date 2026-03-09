BEGIN;

ALTER TABLE IF EXISTS ctf_events
ADD COLUMN freeze_time TIMESTAMPTZ,
ADD COLUMN flag_format varchar(256) not null default 'SPETSCTF{...}';

UPDATE ctf_events
SET
  freeze_time = end_time
WHERE
  freeze_time IS NULL;

ALTER TABLE IF EXISTS ctf_events
ALTER COLUMN freeze_time
SET NOT NULL;

CREATE OR REPLACE FUNCTION set_freeze_time_default () RETURNS TRIGGER AS $$
BEGIN
  IF NEW.freeze_time IS NULL THEN
    NEW.freeze_time := NEW.end_time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_freeze_time_default BEFORE INSERT
OR
UPDATE ON ctf_events FOR EACH ROW
EXECUTE FUNCTION set_freeze_time_default ();

COMMIT;
