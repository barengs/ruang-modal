#!/usr/bin/env bash
set -e

cd /var/www/html

# Default environment flags
export RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
export RUN_SEEDER="${RUN_SEEDER:-false}"
export RUN_QUEUE_WORKER="${RUN_QUEUE_WORKER:-false}"

# Ensure storage, cache, database, and upload directories exist & are writable
mkdir -p \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    database \
    public/uploads/modal \
    public/images/etalase/uploads

# If SQLite is selected, make sure the SQLite database file exists
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_FILE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    if [ ! -f "$DB_FILE" ]; then
        echo "==> Creating SQLite database file at $DB_FILE..."
        mkdir -p "$(dirname "$DB_FILE")"
        touch "$DB_FILE"
    fi
fi

chown -R www-data:www-data storage bootstrap/cache database public/uploads public/images/etalase
chmod -R 775 storage bootstrap/cache database public/uploads public/images/etalase

# Wait for MySQL/MariaDB if DB_CONNECTION=mysql or mariadb
if [ "${DB_CONNECTION}" = "mysql" ] || [ "${DB_CONNECTION}" = "mariadb" ]; then
    echo "==> Waiting for database (${DB_HOST:-db}:${DB_PORT:-3306})..."
    MAX_TRIES=30
    COUNT=0
    until php -r "
        try {
            new PDO(
                'mysql:host=' . (getenv('DB_HOST') ?: 'db') . ';port=' . (getenv('DB_PORT') ?: '3306'),
                getenv('DB_USERNAME') ?: 'root',
                getenv('DB_PASSWORD') ?: ''
            );
            exit(0);
        } catch (Throwable \$e) {
            exit(1);
        }
    " >/dev/null 2>&1; do
        COUNT=$((COUNT + 1))
        if [ "$COUNT" -ge "$MAX_TRIES" ]; then
            echo "==> ERROR: Database connection timed out after ${MAX_TRIES} attempts."
            exit 1
        fi
        echo "==> Database not ready yet (attempt ${COUNT}/${MAX_TRIES}), retrying in 2s..."
        sleep 2
    done
    echo "==> Database connection established!"
fi

# Create public storage symlink if missing
if [ ! -L public/storage ]; then
    php artisan storage:link --ansi || true
fi

# Run database migrations automatically if enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "==> Running database migrations..."
    php artisan migrate --force --ansi
fi

# Run database seeders if explicitly enabled (e.g., initial deployment)
if [ "$RUN_SEEDER" = "true" ]; then
    echo "==> Running database seeders..."
    php artisan db:seed --force --ansi
fi

# Cache Laravel configuration, routes, and views in production
if [ "${APP_ENV:-production}" = "production" ]; then
    echo "==> Optimizing Laravel caches for production..."
    php artisan optimize --ansi
fi

echo "==> Starting Supervisor (Nginx + PHP-FPM)..."
exec "$@"
