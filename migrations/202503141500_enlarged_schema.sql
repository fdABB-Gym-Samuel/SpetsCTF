ALTER TABLE challenges ADD COLUMN display_name VARCHAR(64);
ALTER TABLE challenges ADD COLUMN flag TEXT NOT NULL;
ALTER TABLE challenges ADD COLUMN flag_format VARCHAR(64);
