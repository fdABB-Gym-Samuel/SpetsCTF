BEGIN;

DROP TRIGGER IF EXISTS trg_freeze_time_default ON ctf_events;

DROP FUNCTION IF EXISTS set_freeze_time_default ();

ALTER TABLE IF EXISTS ctf_events
DROP COLUMN IF EXISTS freeze_time,
DROP COLUMN IF EXISTS flag_format;

COMMIT;
