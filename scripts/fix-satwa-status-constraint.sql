-- Fix satwa status constraint to include Indonesian status values
-- This updates the CHECK constraint to allow both English and Indonesian status values

-- First, update existing records with invalid status to valid ones
UPDATE satwa 
SET status = 'IN_TRANSIT' 
WHERE status = 'Dalam Perjalanan';

-- Drop the existing constraint
ALTER TABLE satwa DROP CONSTRAINT IF EXISTS satwa_status_check;

-- Add new constraint with both English and Indonesian values
ALTER TABLE satwa 
ADD CONSTRAINT satwa_status_check 
CHECK (status IN (
  'PENDING', 'IN_TRANSIT', 'COMPLETED',
  'Menunggu', 'Dalam Perjalanan', 'Selesai'
));

-- Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'satwa'::regclass AND contype = 'c';
