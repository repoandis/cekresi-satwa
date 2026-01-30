# 🚀 Migration Guide: Supabase to PostgreSQL + MinIO

This guide helps you migrate your Next.js application from Supabase to self-hosted PostgreSQL and MinIO.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 16+ and npm/yarn
- Access to your Supabase project dashboard
- Backup of your Supabase data

## 🏗️ Architecture

**Before (Supabase):**
```
Next.js App → Supabase (Database + Storage + Auth)
```

**After (Self-hosted):**
```
Next.js App → PostgreSQL (Database) + MinIO (Storage) + Custom Auth
```

## 📁 Migration Files Structure

```
migration/
├── setup-postgres-minio.sh    # Initial setup script
├── migrate-data.sh           # Data migration script
├── update-config.sh          # Configuration update script
├── docker-compose.yml        # Docker services
└── README.md                 # This guide
```

## 🛠️ Step-by-Step Migration

### Step 1: Setup Infrastructure

#### Option A: Using Docker Compose (Recommended)

```bash
# Navigate to migration directory
cd migration

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

#### Option B: Manual Setup

```bash
# Make scripts executable
chmod +x *.sh

# Run setup script
./setup-postgres-minio.sh
```

### Step 2: Export Data from Supabase

1. **Database Export:**
   ```bash
   # From Supabase dashboard:
   # Settings → Database → Backup → Create Backup
   
   # Or using pg_dump:
   pg_dump 'postgresql://[user]:[password]@[host]:[port]/[database]' > supabase_backup.sql
   ```

2. **File Export:**
   - Go to Supabase Storage dashboard
   - Download all files from your buckets
   - Save to a local directory

### Step 3: Migrate Data

```bash
# Run data migration
./migrate-data.sh supabase_backup.sql
```

### Step 4: Update Application Configuration

```bash
# Update application files
./update-config.sh
```

## 🔧 Configuration Files

### Environment Variables (.env.local)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cekresi_satwa
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_BUCKET=cekresi-files
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Docker Services

- **PostgreSQL:** `localhost:5432`
- **MinIO API:** `localhost:9000`
- **MinIO Console:** `localhost:9001`
- **PgAdmin:** `localhost:5050` (optional)
- **Redis:** `localhost:6379` (optional)

## 📊 Database Schema

Your existing schema is preserved:

- `users` - User management
- `satwa` - Animal tracking data
- `progress` - Progress updates
- `dokumen` - Document management

## 🔐 Authentication Migration

The migration provides a basic authentication system. For production:

1. **Password Hashing:** Implement bcrypt/scrypt
2. **Session Management:** Use JWT or sessions
3. **Security:** Add rate limiting, CSRF protection

Example authentication flow:

```typescript
// lib/migration-helpers.ts
import { users } from './migration-helpers'

// Login
const user = await users.findByUsername(username)
if (user && await verifyPassword(password, user.password)) {
  // Create session/JWT
}
```

## 📁 File Storage Migration

Files are migrated from Supabase Storage URLs to MinIO:

```typescript
// lib/storage.ts
import { storage } from './storage'

// Upload file
await storage.uploadFile('bucket', 'filename.jpg', buffer)

// Get file URL
const url = storage.getFileUrl('bucket', 'filename.jpg')
```

## 🧪 Testing the Migration

### Database Connection Test

```bash
# Test PostgreSQL connection
psql -h localhost -p 5432 -U postgres -d cekresi_satwa

# Check tables
\dt
```

### MinIO Connection Test

```bash
# Access MinIO Console
open http://localhost:9001
# Login: minioadmin / minioadmin123
```

### Application Test

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/satwa
```

## 🔄 Rollback Plan

If you need to rollback:

1. **Database:** Restore from Supabase backup
2. **Files:** Re-upload to Supabase Storage
3. **Configuration:** Restore backup files
   ```bash
   cp lib/supabase.ts.backup lib/supabase.ts
   cp .env.local.backup .env.local
   ```

## 📈 Performance Considerations

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_satwa_kode_resi ON satwa(kode_resi);
CREATE INDEX CONCURRENTLY idx_progress_satwa_id ON progress(satwa_id);
CREATE INDEX CONCURRENTLY idx_dokumen_satwa_id ON dokumen(satwa_id);
```

### MinIO Optimization

- Enable compression for file uploads
- Use CDN for static assets in production
- Implement file caching strategies

## 🔒 Security Best Practices

### Database Security

```bash
# Create read-only user for reporting
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE cekresi_satwa TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### MinIO Security

```bash
# Create limited access user
mc admin user add myminio appuser apppassword
mc admin policy add myminio appuser-policy /path/to/policy.json
mc admin policy set myminio appuser appuser-policy
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MinIO Documentation](https://docs.min.io/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Docker Compose](https://docs.docker.com/compose/)

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   docker-compose logs postgres
   
   # Verify credentials
   psql -h localhost -p 5432 -U postgres -d cekresi_satwa
   ```

2. **MinIO Connection Failed**
   ```bash
   # Check MinIO status
   docker-compose logs minio
   
   # Test connectivity
   curl http://localhost:9000/minio/health/live
   ```

3. **File Upload Issues**
   - Check bucket permissions
   - Verify file size limits
   - Check network connectivity

### Getting Help

1. Check Docker logs: `docker-compose logs [service]`
2. Verify environment variables
3. Test database and storage connections separately
4. Review migration script outputs

## ✅ Migration Checklist

- [ ] Backup Supabase data
- [ ] Setup Docker services
- [ ] Export database from Supabase
- [ ] Run data migration
- [ ] Update application configuration
- [ ] Test database connections
- [ ] Test file uploads/downloads
- [ ] Update authentication logic
- [ ] Test all API endpoints
- [ ] Performance testing
- [ ] Security review
- [ ] Documentation update

## 🎉 Post-Migration

After successful migration:

1. **Monitor:** Set up monitoring for database and storage
2. **Backup:** Implement regular backup strategies
3. **Scale:** Plan for scaling based on usage
4. **Optimize:** Continuously optimize performance

---

**Note:** This migration preserves your existing data structure while moving to a self-hosted infrastructure. Test thoroughly in a development environment before applying to production.
