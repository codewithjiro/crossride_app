-- Migration: Split driver name into firstName, middleName, and surname
-- This migration adds new columns and handles data migration

-- Step 1: Add new columns
ALTER TABLE cross_ride_driver ADD COLUMN "firstName" varchar(255) NOT NULL DEFAULT '';
ALTER TABLE cross_ride_driver ADD COLUMN "middleName" varchar(255);
ALTER TABLE cross_ride_driver ADD COLUMN "surname" varchar(255) NOT NULL DEFAULT '';

-- Step 2: Migrate existing data from 'name' to firstName and surname
-- Assuming the format is "FirstName Surname" or "FirstName MiddleName Surname"
-- We'll split on spaces - first word is firstName, last word is surname, middle words are middleName
UPDATE cross_ride_driver SET
  "firstName" = CASE 
    WHEN "name" ~ ' ' THEN TRIM(SUBSTRING("name" FROM 1 FOR POSITION(' ' IN "name") - 1))
    ELSE "name"
  END,
  "middleName" = CASE
    WHEN "name" ~ ' ' THEN (
      SELECT CASE
        WHEN string_agg(word, ' ' ORDER BY idx) IS NOT NULL THEN string_agg(word, ' ' ORDER BY idx)
        ELSE NULL
      END
      FROM (
        SELECT idx, word FROM regexp_split_to_table("name", ' ') WITH ORDINALITY AS t(word, idx)
        WHERE idx > 1 AND idx < (SELECT COUNT(*) FROM regexp_split_to_table("name", ' '))
      ) subquery
    )
    ELSE NULL
  END,
  "surname" = CASE
    WHEN "name" ~ ' ' THEN TRIM(SUBSTRING("name" FROM POSITION(' ' IN (SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)))::int + POSITION(' ' IN "name")))
    ELSE "name"
  END
WHERE "firstName" = '';

-- Alternative simpler approach: split by space - first part is firstName, rest is surname
UPDATE cross_ride_driver SET
  "firstName" = SPLIT_PART("name", ' ', 1),
  "surname" = CASE
    WHEN array_length(string_to_array("name", ' '), 1) > 1 
    THEN array_to_string(string_to_array("name", ' ')[2:], ' ')
    ELSE SPLIT_PART("name", ' ', 1)
  END
WHERE "firstName" = '';

-- Step 3: Drop the old 'name' column
ALTER TABLE cross_ride_driver DROP COLUMN "name";
