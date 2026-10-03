#!/usr/bin/env bash
set -e

# Start services
service postgresql start
service redis-server start

# Configure postgresql
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/18/main/postgresql.conf || true
grep -q "host all all 0.0.0.0/0 md5" /etc/postgresql/18/main/pg_hba.conf || echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/18/main/pg_hba.conf
grep -q "host all all 127.0.0.1/32 trust" /etc/postgresql/18/main/pg_hba.conf || echo "host all all 127.0.0.1/32 trust" >> /etc/postgresql/18/main/pg_hba.conf

# Setup database & user
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='miraaj'\" | grep -q 1 || psql -c \"CREATE ROLE miraaj WITH LOGIN PASSWORD 'miraaj' SUPERUSER;\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='miraaj'\" | grep -q 1 || psql -c \"CREATE DATABASE miraaj OWNER miraaj;\""
su - postgres -c "psql -c \"ALTER USER miraaj WITH PASSWORD 'miraaj';\""

# Configure redis
sed -i "s/^bind .*/bind 0.0.0.0/g" /etc/redis/redis.conf || true
sed -i "s/^protected-mode yes/protected-mode no/g" /etc/redis/redis.conf || true

service postgresql restart
service redis-server restart

echo "PostgreSQL & Redis setup completed successfully in WSL!"
