# Cek Resi App

Aplikasi cek resi dengan authentication menggunakan Next.js, Supabase, Tailwind CSS, dan shadcn/ui.

## Features

- 🔐 Authentication dengan username dan password
- 👥 Role-based access control (Admin dan User)
- 🎨 Modern UI dengan Tailwind CSS dan shadcn/ui
- 🗄️ Database Supabase
- 📱 Responsive design
- 🐾 **Cek Resi Satwa** - Tracking pengiriman satwa
- 📊 **Progress Timeline** - Visual timeline perjalanan
- 📎 **Dokumen Management** - Upload dan kelola dokumen pendukung
- 🔍 **Search Resi** - Pencarian cepat dengan history
- 📋 **Semua Resi** - Lihat semua data resi dengan filter dan pagination
- ⚡ **Real-time Updates** - Update status instan

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy URL dan Anonymous Key dari project settings
3. Jalankan SQL migration di Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster login queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

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
```

4. **Create Storage Bucket** (untuk upload dokumen):
   - Buka Supabase Dashboard → Storage
   - Create new bucket dengan nama `dokumen`
   - Set sebagai Public bucket
   - Atur file size limit sesuai kebutuhan (default: 50MB)
   - **Important**: Jalankan SQL berikut untuk disable RLS:
     ```sql
     ALTER TABLE dokumen DISABLE ROW LEVEL SECURITY;
     ```

5. **Troubleshooting Upload Dokumen**:
   - Jika upload gagal dengan error "row-level security policy", jalankan SQL di atas
   - Pastikan storage bucket bernama `dokumen` sudah dibuat
   - Pastikan `SUPABASE_SERVICE_ROLE_KEY` ada di `.env.local`

6. **Troubleshooting Select Component**:
   - Jika error "A <Select.Item /> must have a value prop that is not an empty string":
     - Ini sudah diperbaiki dengan mengganti empty string menjadi "all"
     - Refresh browser untuk meload component yang sudah diperbaiki

### 3. Environment Variables

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 4. Run Development Server

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Default Login

- **Admin**: username `admin`, password `admin123`
- **User**: Create new user through dashboard (admin only)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── satwas/           # API routes untuk satwa CRUD
│   │   │   ├── [id]/         # Dynamic routes untuk spesifik satwa
│   │   │   │   ├── progress/ # Progress tracking API
│   │   │   │   └── dokumen/  # Dokumen management API
│   │   │   └── route.ts
│   │   └── resi/             # API untuk search resi
│   │       ├── all/           # API untuk semua resi dengan filter
│   │       └── route.ts
│   ├── layout.tsx            # Root layout dengan AuthProvider
│   └── page.tsx             # Main page dengan login/dashboard logic
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx    # Login form component
│   │   ├── Dashboard.tsx    # Dashboard component
│   │   └── UserManagement.tsx # User management component
│   ├── cekresi/
│   │   ├── SatwaManagement.tsx # Admin satwa management
│   │   ├── ResiSearch.tsx   # User resi search with all resi tab
│   │   └── AllResiList.tsx # All resi list with filter & pagination
│   └── ui/                  # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── auth.ts             # Authentication functions
│   ├── supabase.ts         # Supabase client configuration
│   └── utils.ts            # Utility functions
├── database/
│   └── migrations/         # SQL migration files
└── scripts/               # Utility scripts
```

## Tech Stack

- **Framework**: Next.js 16
- **Database**: Supabase
- **UI**: Tailwind CSS + shadcn/ui
- **Authentication**: Custom auth dengan Supabase
- **Language**: TypeScript

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
