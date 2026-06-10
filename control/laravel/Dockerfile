FROM php:8.4-fpm

RUN apt-get update -y \
	&& apt-get install -y libmcrypt-dev openssl openssh-client git zip unzip \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Fixed version of composer for php 8.4
COPY --from=composer:2.10 /usr/bin/composer /usr/bin/composer
# RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN pecl install mcrypt-1.0.9  \
    && docker-php-ext-enable mcrypt \
    && docker-php-ext-install mysqli pdo_mysql

ARG working_dir=/var/www/laravel-app/
RUN useradd --uid 1000 --user-group -ms /bin/bash www
#RUN mkdir $working_dir && chown -R www:www $working_dir

COPY --chown=www:www entrypoint.sh /entrypoint.sh
WORKDIR /tmp
ADD https://github.com/laravel/laravel/archive/refs/tags/v13.8.0.tar.gz .
RUN tar -xzvf v13.8.0.tar.gz && mv laravel-13.8.0 $working_dir \
    && chown -R www:www $working_dir \
    && chmod +x /entrypoint.sh

WORKDIR $working_dir
USER www

RUN rm -rf vendor composer.lock && \
	composer config disable-tls true && \
	composer install --no-dev --no-scripts --ignore-platform-reqs && \
	composer dump-autoload && \
	composer clear-cache && \
	rm -rf ~/.composer/cache* && \
    composer require laravel/breeze --dev && \
    php artisan breeze:install api 


ENTRYPOINT ["/entrypoint.sh"]