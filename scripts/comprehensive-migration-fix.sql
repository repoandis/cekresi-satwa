-- Comprehensive Migration Fix Script
-- This script fixes common issues after migrating from Supabase to PostgreSQL + MinIO

-- 1. Fix status constraints and data
DO $$
BEGIN
    -- Update existing Indonesian status to English
    UPDATE satwa SET status = 'IN_TRANSIT' WHERE status = 'Dalam Perjalanan';
    UPDATE satwa SET status = 'PENDING' WHERE status = 'Menunggu';
    UPDATE satwa SET status = 'COMPLETED' WHERE status = 'Selesai';
    
    -- Drop and recreate constraint with both languages
    ALTER TABLE satwa DROP CONSTRAINT IF EXISTS satwa_status_check;
    
    ALTER TABLE satwa 
    ADD CONSTRAINT satwa_status_check 
    CHECK (status IN (
        'PENDING', 'IN_TRANSIT', 'COMPLETED',
        'Menunggu', 'Dalam Perjalanan', 'Selesai'
    ));
END $$;

-- 2. Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_satwa_kode_resi ON satwa(kode_resi);
CREATE INDEX IF NOT EXISTS idx_satwa_status ON satwa(status);
CREATE INDEX IF NOT EXISTS idx_progress_satwa_id ON progress(satwa_id);
CREATE INDEX IF NOT EXISTS idx_progress_tanggal ON progress(tanggal);
CREATE INDEX IF NOT EXISTS idx_dokumen_satwa_id ON dokumen(satwa_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 3. Fix timestamp issues if any
UPDATE satwa SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE progress SET tanggal = NOW() WHERE tanggal IS NULL;
UPDATE dokumen SET uploaded_at = NOW() WHERE uploaded_at IS NULL;

-- 4. Ensure UUID columns are properly set
DO $$
BEGIN
    -- Add UUID generation if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'satwa' AND column_name = 'id' AND column_default LIKE '%gen_random_uuid%') THEN
        ALTER TABLE satwa ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progress' AND column_name = 'id' AND column_default LIKE '%gen_random_uuid%') THEN
        ALTER TABLE progress ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dokumen' AND column_name = 'id' AND column_default LIKE '%gen_random_uuid%') THEN
        ALTER TABLE dokumen ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id' AND column_default LIKE '%gen_random_uuid%') THEN
        ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;

-- 5. Create admin user if not exists
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 6. Verify table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('satwa', 'progress', 'dokumen', 'users')
ORDER BY table_name, ordinal_position;

-- 7. Check data integrity
SELECT 
    'satwa' as table_name, COUNT(*) as record_count
FROM satwa
UNION ALL
SELECT 
    'progress' as table_name, COUNT(*) as record_count
FROM progress
UNION ALL
SELECT 
    'dokumen' as table_name, COUNT(*) as record_count
FROM dokumen
UNION ALL
SELECT 
    'users' as table_name, COUNT(*) as record_count
FROM users;

-- 8. Check for orphaned records
SELECT 'Orphaned progress records' as issue, COUNT(*) as count
FROM progress p
LEFT JOIN satwa s ON p.satwa_id = s.id
WHERE s.id IS NULL
UNION ALL
SELECT 'Orphaned dokumen records' as issue, COUNT(*) as count
FROM dokumen d
LEFT JOIN satwa s ON d.satwa_id = s.id
WHERE s.id IS NULL;

COMMIT;

-- Output completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration fix completed successfully!';
    RAISE NOTICE '📋 Please check the output above for any issues';
END $$;
