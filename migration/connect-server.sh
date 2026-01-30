#!/bin/bash

# Connection Script to Server Database (192.168.0.76)
# This script provides quick commands to connect to server database

set -e

# Server Configuration
SERVER_IP="192.168.0.76"
DB_HOST="192.168.0.76"
DB_PORT="5432"
DB_NAME="cekresi_satwa"
DB_USER="postgres"
DB_PASSWORD="your_postgres_password"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Test server connectivity
test_server_connection() {
    header "Testing Server Connectivity"
    
    log "Pinging server $SERVER_IP..."
    if ping -c 3 $SERVER_IP &> /dev/null; then
        log "✅ Server is reachable"
    else
        error "❌ Server is not reachable"
        exit 1
    fi
    
    log "Testing PostgreSQL port $DB_PORT..."
    if nc -z $SERVER_IP $DB_PORT 2>/dev/null; then
        log "✅ PostgreSQL port is open"
    else
        warn "⚠️ PostgreSQL port might be blocked"
    fi
    
    log "Testing MinIO port 9000..."
    if nc -z $SERVER_IP 9000 2>/dev/null; then
        log "✅ MinIO port is open"
    else
        warn "⚠️ MinIO port might be blocked"
    fi
}

# Database connection commands
database_commands() {
    header "Database Connection Commands"
    
    echo -e "${BLUE}1. Connect to Database:${NC}"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo ""
    
    echo -e "${BLUE}2. Import Schema:${NC}"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/001_create_users_table.sql"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/002_create_satwa_tables.sql"
    echo ""
    
    echo -e "${BLUE}3. Check Tables:${NC}"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\\dt'"
    echo ""
    
    echo -e "${BLUE}4. Check Data:${NC}"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM users;'"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM satwa;'"
    echo ""
}

# MinIO connection commands
minio_commands() {
    header "MinIO Connection Commands"
    
    echo -e "${BLUE}1. MinIO Console:${NC}"
    echo "http://$SERVER_IP:9001"
    echo "Username: minioadmin"
    echo "Password: minioadmin123"
    echo ""
    
    echo -e "${BLUE}2. Test MinIO with curl:${NC}"
    echo "curl http://$SERVER_IP:9000/minio/health/live"
    echo ""
    
    echo -e "${BLUE}3. List buckets (with mc):${NC}"
    echo "mc alias set server http://$SERVER_IP:9000 minioadmin minioadmin123"
    echo "mc ls server"
    echo ""
}

# Application testing commands
app_commands() {
    header "Application Testing Commands"
    
    echo -e "${BLUE}1. Start Application:${NC}"
    echo "npm run dev"
    echo ""
    
    echo -e "${BLUE}2. Test API Endpoints:${NC}"
    echo "curl http://localhost:3000/api/satwa"
    echo "curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
    echo ""
    
    echo -e "${BLUE}3. Test Database API:${NC}"
    echo "curl http://localhost:3000/api/satwa -v"
    echo ""
}

# Quick setup commands
setup_commands() {
    header "Quick Setup Commands"
    
    echo -e "${BLUE}1. Import Database Schema:${NC}"
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/001_create_users_table.sql && psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/002_create_satwa_tables.sql"
    echo ""
    
    echo -e "${BLUE}2. Create .env.local (if not exists):${NC}"
    echo "cat > .env.local << EOF"
    echo "# Database Configuration"
    echo "DB_HOST=$DB_HOST"
    echo "DB_PORT=$DB_PORT"
    echo "DB_NAME=$DB_NAME"
    echo "DB_USER=$DB_USER"
    echo "DB_PASSWORD=$DB_PASSWORD"
    echo ""
    echo "# MinIO Configuration"
    echo "MINIO_ENDPOINT=$DB_HOST"
    echo "MINIO_PORT=9000"
    echo "MINIO_BUCKET=cekresi-files"
    echo "MINIO_ACCESS_KEY=minioadmin"
    echo "MINIO_SECRET_KEY=minioadmin123"
    echo ""
    echo "# Application Configuration"
    echo "NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3000"
    echo "NODE_ENV=development"
    echo "EOF"
    echo ""
}

# Interactive menu
interactive_menu() {
    while true; do
        header "Connection Menu - Server: $SERVER_IP"
        echo "1. Test Server Connectivity"
        echo "2. Show Database Commands"
        echo "3. Show MinIO Commands"
        echo "4. Show Application Commands"
        echo "5. Show Setup Commands"
        echo "6. Quick Connect to Database"
        echo "7. Open MinIO Console"
        echo "0. Exit"
        echo ""
        read -p "Choose option: " choice
        
        case $choice in
            1) test_server_connection ;;
            2) database_commands ;;
            3) minio_commands ;;
            4) app_commands ;;
            5) setup_commands ;;
            6) 
                log "Connecting to database..."
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
                ;;
            7) 
                log "Opening MinIO Console..."
                if command -v xdg-open &> /dev/null; then
                    xdg-open "http://$SERVER_IP:9001"
                elif command -v open &> /dev/null; then
                    open "http://$SERVER_IP:9001"
                else
                    echo "Open manually: http://$SERVER_IP:9001"
                fi
                ;;
            0) exit 0 ;;
            *) error "Invalid option" ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
}

# Quick connect function
quick_connect() {
    header "Quick Connect to Server Database"
    log "Server: $SERVER_IP"
    log "Database: $DB_NAME"
    log "User: $DB_USER"
    echo ""
    
    read -p "Connect to database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
    fi
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        interactive_menu
    else
        case $1 in
            "test") test_server_connection ;;
            "db") database_commands ;;
            "minio") minio_commands ;;
            "app") app_commands ;;
            "setup") setup_commands ;;
            "connect") quick_connect ;;
            *) 
                echo "Usage: $0 [test|db|minio|app|setup|connect]"
                echo "Or run without arguments for interactive menu"
                ;;
        esac
    fi
}

# Run main function
main "$@"
