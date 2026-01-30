#!/bin/bash

# Migration Script: Supabase to PostgreSQL + MinIO
# Author: Migration Assistant
# Date: $(date)

set -e

echo "🚀 Starting migration from Supabase to PostgreSQL + MinIO..."

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

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is installed
check_postgres() {
    log "Checking PostgreSQL installation..."
    if ! command -v psql &> /dev/null; then
        error "PostgreSQL is not installed. Please install PostgreSQL first."
        echo "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        echo "CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
        echo "Windows: Download from https://www.postgresql.org/download/windows/"
        exit 1
    fi
    log "PostgreSQL found: $(psql --version)"
}

# Check if Docker is installed (for MinIO)
check_docker() {
    log "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        echo "Download from: https://www.docker.com/get-started"
        exit 1
    fi
    log "Docker found: $(docker --version)"
}

# Setup PostgreSQL database
setup_postgres() {
    log "Setting up PostgreSQL database..."
    
    # Create database if it doesn't exist
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || log "Database $DB_NAME already exists"
    
    # Create user if it doesn't exist
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || log "User $DB_USER already exists"
    
    # Grant privileges
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    
    log "PostgreSQL database setup completed"
}

# Setup MinIO using Docker
setup_minio() {
    log "Setting up MinIO..."
    
    # Stop existing MinIO container if running
    docker stop minio-server 2>/dev/null || true
    docker rm minio-server 2>/dev/null || true
    
    # Create data directory
    mkdir -p ./minio-data
    
    # Run MinIO container
    docker run -d \
        --name minio-server \
        -p $MINIO_PORT:9000 \
        -p 9001:9001 \
        -v "$(pwd)/minio-data:/data" \
        -e "MINIO_ROOT_USER=$MINIO_ROOT_USER" \
        -e "MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD" \
        minio/minio server /data --console-address ":9001"
    
    log "Waiting for MinIO to start..."
    sleep 10
    
    # Create bucket
    log "Creating MinIO bucket: $MINIO_BUCKET"
    docker exec minio-server mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
    docker exec minio-server mc mb local/$MINIO_BUCKET --ignore-existing
    docker exec minio-server mc policy set public local/$MINIO_BUCKET
    
    log "MinIO setup completed"
    log "MinIO Console: http://localhost:9001"
    log "MinIO API: http://localhost:9000"
}

# Create database schema
create_schema() {
    log "Creating database schema..."
    
    # Apply migrations
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/001_create_users_table.sql
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/002_create_satwa_tables.sql
    
    log "Database schema created successfully"
}

# Export data from Supabase (manual step)
export_from_supabase() {
    warn "⚠️  MANUAL STEP REQUIRED"
    echo "To export data from Supabase:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to Settings > Database"
    echo "3. Click 'Backup' or use pg_dump:"
    echo "   pg_dump 'postgresql://[user]:[password]@[host]:[port]/[database]' > supabase_backup.sql"
    echo "4. For files: Download from Supabase Storage dashboard"
    echo ""
    echo "After exporting, run:"
    echo "   ./migrate-data.sh supabase_backup.sql"
}

# Main execution
main() {
    log "Starting migration setup..."
    
    check_postgres
    check_docker
    
    read -p "Do you want to setup PostgreSQL? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_postgres
    fi
    
    read -p "Do you want to setup MinIO? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_minio
    fi
    
    read -p "Do you want to create database schema? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_schema
    fi
    
    export_from_supabase
    
    log "Setup completed! Next steps:"
    echo "1. Export data from Supabase"
    echo "2. Run migration script for data"
    echo "3. Update application configuration"
    echo "4. Test the new setup"
}

# Run main function
main "$@"
