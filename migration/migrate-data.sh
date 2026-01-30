#!/bin/bash

# Data Migration Script: Supabase Backup to PostgreSQL
# Usage: ./migrate-data.sh supabase_backup.sql

set -e

# Configuration
DB_NAME="cekresi_satwa"
DB_USER="postgres"
DB_PASSWORD="your_postgres_password"
DB_HOST="localhost"
DB_PORT="5432"

MINIO_ROOT_USER="minioadmin"
MINIO_ROOT_PASSWORD="minioadmin123"
MINIO_BUCKET="cekresi-files"
MINIO_PORT="9000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if backup file exists
check_backup_file() {
    if [ ! -f "$1" ]; then
        error "Backup file '$1' not found!"
        echo "Usage: $0 <supabase_backup.sql>"
        exit 1
    fi
    log "Found backup file: $1"
}

# Clean existing data
clean_data() {
    log "Cleaning existing data..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        TRUNCATE TABLE progress, dokumen, satwa, users RESTART IDENTITY CASCADE;
    "
    log "Data cleaned successfully"
}

# Import data from backup
import_data() {
    local backup_file="$1"
    log "Importing data from $backup_file..."
    
    # Extract only the data we need (skip schema creation)
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
-- Import users data
INSERT INTO users (id, username, password, role, created_at, updated_at)
SELECT id, username, password, role, created_at, updated_at
FROM (
    SELECT * FROM dblink('host=$DB_HOST port=$DB_PORT dbname=supabase_backup user=$DB_USER password=$DB_PASSWORD', 
        'SELECT id, username, password, role, created_at, updated_at FROM users')
    AS t(id uuid, username varchar, password varchar, role varchar, created_at timestamptz, updated_at timestamptz)
) AS sub
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.id = sub.id);

-- Import satwa data
INSERT INTO satwa (id, kode_resi, nama, spesies, asal, tujuan, status, created_at, updated_at)
SELECT id, kode_resi, nama, spesies, asal, tujuan, status, created_at, updated_at
FROM (
    SELECT * FROM dblink('host=$DB_HOST port=$DB_PORT dbname=supabase_backup user=$DB_USER password=$DB_PASSWORD', 
        'SELECT id, kode_resi, nama, spesies, asal, tujuan, status, created_at, updated_at FROM satwa')
    AS t(id uuid, kode_resi varchar, nama varchar, spesies varchar, asal varchar, tujuan varchar, status varchar, created_at timestamptz, updated_at timestamptz)
) AS sub
WHERE NOT EXISTS (SELECT 1 FROM satwa WHERE satwa.id = sub.id);

-- Import progress data
INSERT INTO progress (id, satwa_id, status, lokasi, keterangan, tanggal, created_at)
SELECT id, satwa_id, status, lokasi, keterangan, tanggal, created_at
FROM (
    SELECT * FROM dblink('host=$DB_HOST port=$DB_PORT dbname=supabase_backup user=$DB_USER password=$DB_PASSWORD', 
        'SELECT id, satwa_id, status, lokasi, keterangan, tanggal, created_at FROM progress')
    AS t(id uuid, satwa_id uuid, status varchar, lokasi varchar, keterangan text, tanggal timestamptz, created_at timestamptz)
) AS sub
WHERE NOT EXISTS (SELECT 1 FROM progress WHERE progress.id = sub.id);

-- Import dokumen data
INSERT INTO dokumen (id, satwa_id, nama, file_url, uploaded_at)
SELECT id, satwa_id, nama, file_url, uploaded_at
FROM (
    SELECT * FROM dblink('host=$DB_HOST port=$DB_PORT dbname=supabase_backup user=$DB_USER password=$DB_PASSWORD', 
        'SELECT id, satwa_id, nama, file_url, uploaded_at FROM dokumen')
    AS t(id uuid, satwa_id uuid, nama varchar, file_url varchar, uploaded_at timestamptz)
) AS sub
WHERE NOT EXISTS (SELECT 1 FROM dokumen WHERE dokumen.id = sub.id);
EOF

    # Alternative: Use sed to extract INSERT statements from backup
    log "Extracting INSERT statements from backup..."
    grep "^INSERT INTO" "$backup_file" | grep -E "(users|satwa|progress|dokumen)" > temp_inserts.sql
    
    # Replace table names if needed and execute
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f temp_inserts.sql
    rm temp_inserts.sql
    
    log "Data import completed"
}

# Migrate files from Supabase Storage URLs to MinIO
migrate_files() {
    log "Starting file migration..."
    
    # Create temporary directory for downloaded files
    mkdir -p temp_files
    
    # Get all file URLs from database
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
        SELECT id, file_url FROM dokumen WHERE file_url IS NOT NULL;
    " | while read -r id url; do
        if [ ! -z "$id" ] && [ ! -z "$url" ]; then
            # Clean up the variables
            id=$(echo $id | xargs)
            url=$(echo $url | xargs)
            
            log "Downloading file for dokumen ID: $id"
            
            # Extract filename from URL
            filename=$(basename "$url")
            
            # Download file from Supabase
            if curl -L "$url" -o "temp_files/$filename" 2>/dev/null; then
                # Upload to MinIO
                docker exec minio-server mc cp "/data/temp_files/$filename" "local/$MINIO_BUCKET/$filename"
                
                # Update database with new MinIO URL
                new_url="http://localhost:$MINIO_PORT/$MINIO_BUCKET/$filename"
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
                    UPDATE dokumen SET file_url = '$new_url' WHERE id = '$id';
                "
                
                log "Migrated file: $filename -> $new_url"
            else
                warn "Failed to download: $url"
            fi
        fi
    done
    
    # Clean up temporary files
    rm -rf temp_files
    
    log "File migration completed"
}

# Verify migration
verify_migration() {
    log "Verifying migration..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
        SELECT 'users' as table_name, COUNT(*) as record_count FROM users
        UNION ALL
        SELECT 'satwa', COUNT(*) FROM satwa
        UNION ALL
        SELECT 'progress', COUNT(*) FROM progress
        UNION ALL
        SELECT 'dokumen', COUNT(*) FROM dokumen;
    "
    
    log "Migration verification completed"
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        error "Please provide Supabase backup file"
        echo "Usage: $0 <supabase_backup.sql>"
        exit 1
    fi
    
    local backup_file="$1"
    
    log "Starting data migration..."
    check_backup_file "$backup_file"
    
    read -p "Do you want to clean existing data before import? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        clean_data
    fi
    
    import_data "$backup_file"
    
    read -p "Do you want to migrate files from Supabase Storage to MinIO? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        migrate_files
    fi
    
    verify_migration
    
    log "Data migration completed successfully!"
    log "Next steps:"
    echo "1. Update application configuration files"
    echo "2. Test database connections"
    echo "3. Verify file uploads/downloads"
    echo "4. Update DNS/host configurations if needed"
}

# Run main function
main "$@"
