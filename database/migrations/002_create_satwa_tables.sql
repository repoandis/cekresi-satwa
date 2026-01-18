-- Create satwa table
CREATE TABLE IF NOT EXISTS satwa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_resi VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  spesies VARCHAR(100) NOT NULL,
  asal VARCHAR(200) NOT NULL,
  tujuan VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress table
CREATE TABLE IF NOT EXISTS progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  satwa_id UUID NOT NULL REFERENCES satwa(id) ON DELETE CASCADE,
  status VARCHAR(100) NOT NULL,
  lokasi VARCHAR(200) NOT NULL,
  keterangan TEXT,
  tanggal TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dokumen table
CREATE TABLE IF NOT EXISTS dokumen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  satwa_id UUID NOT NULL REFERENCES satwa(id) ON DELETE CASCADE,
  nama VARCHAR(200) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_satwa_kode_resi ON satwa(kode_resi);
CREATE INDEX IF NOT EXISTS idx_progress_satwa_id ON progress(satwa_id);
CREATE INDEX IF NOT EXISTS idx_dokumen_satwa_id ON dokumen(satwa_id);

-- Enable Row Level Security (optional for custom auth)
-- ALTER TABLE satwa ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dokumen ENABLE ROW LEVEL SECURITY;

-- For custom authentication, RLS policies can be disabled initially
-- Add policies later when integrating with Supabase Auth

-- Disable RLS for dokumen table to allow file uploads
ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;
