# ==============================================================================
# Stage 1: Build Frontend Assets (React + Vite + Tailwind CSS v4)
# ==============================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js ./
COPY resources ./resources
COPY public ./public

RUN npm run build

# ==============================================================================
# Stage 2: Install PHP Composer Dependencies
# ==============================================================================
FROM composer:2 AS vendor-builder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# ==============================================================================
# Stage 3: Production Runtime (Nginx + PHP-FPM 8.4 + Supervisor)
# ==============================================================================
FROM php:8.4-fpm-alpine AS production

LABEL org.opencontainers.image.title="Ekosistem Alumni SMA Double Track"
LABEL org.opencontainers.image.description="Ruang Modal, Ruang Tumbuh, Ruang Pasar & Monitoring (Laravel + React)"

WORKDIR /var/www/html

# Install runtime dependencies & build libraries for PHP extensions
RUN apk add --no-cache \
        nginx \
        supervisor \
        curl \
        bash \
        icu-libs \
        libzip \
        libpng \
        libjpeg-turbo \
        libwebp \
        freetype \
        sqlite \
        sqlite-libs \
        mysql-client \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        libzip-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        freetype-dev \
        sqlite-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        pdo_sqlite \
        mysqli \
        gd \
        bcmath \
        intl \
        zip \
        opcache \
        pcntl \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/* /tmp/*

# Copy runtime configuration files
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-production.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Copy application source
COPY . /var/www/html
COPY --from=vendor-builder /app/vendor /var/www/html/vendor
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

# Prepare required directories & permissions
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p \
        /var/www/html/storage/app/public \
        /var/www/html/storage/framework/cache/data \
        /var/www/html/storage/framework/sessions \
        /var/www/html/storage/framework/views \
        /var/www/html/storage/logs \
        /var/www/html/bootstrap/cache \
        /var/www/html/database \
        /run/nginx \
        /var/log/supervisor \
    && chown -R www-data:www-data \
        /var/www/html/storage \
        /var/www/html/bootstrap/cache \
        /var/www/html/database \
    && chmod -R 775 \
        /var/www/html/storage \
        /var/www/html/bootstrap/cache \
        /var/www/html/database

# Run composer package discovery without dev packages
RUN php artisan package:discover --ansi || true

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1/up || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
