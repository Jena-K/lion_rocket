#!/bin/bash

# Backup script for Lion Rocket AI Chat Service

set -e

# Configuration
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="lionrocket_backup_${TIMESTAMP}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Lion Rocket Backup Script${NC}"
echo -e "Backup name: ${YELLOW}${BACKUP_NAME}${NC}"

# Create backup directory
mkdir -p ${BACKUP_DIR}/${BACKUP_NAME}

# Backup SQLite database
echo "Backing up database..."
if [ -f "./data/lionrocket.db" ]; then
    cp ./data/lionrocket.db ${BACKUP_DIR}/${BACKUP_NAME}/
    echo "Database backed up successfully"
else
    echo -e "${YELLOW}Warning: Database file not found${NC}"
fi

# Backup environment files
echo "Backing up configuration..."
if [ -f ".env" ]; then
    cp .env ${BACKUP_DIR}/${BACKUP_NAME}/
fi

# Create backup archive
echo "Creating backup archive..."
cd ${BACKUP_DIR}
tar -czf ${BACKUP_NAME}.tar.gz ${BACKUP_NAME}/
rm -rf ${BACKUP_NAME}/

echo -e "${GREEN}Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz${NC}"

# Clean old backups (keep last 7 days)
echo "Cleaning old backups..."
find ${BACKUP_DIR} -name "lionrocket_backup_*.tar.gz" -mtime +7 -delete

echo -e "${GREEN}Backup process complete!${NC}"