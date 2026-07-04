#!/bin/sh
set -e #Exit if any command fails

if [ -z "$DOMAIN_NAME" ]; then
	echo "$0 : Missing required environment variable.";
	exit 1;
fi

TLS_PATH="/etc/nginx/tls"
mkdir -p "$TLS_PATH"

if [ ! -f "$TLS_PATH/server.crt" ] || [ ! -f "$TLS_PATH/server.key" ]; then
	openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
		-subj "/C=BE/ST=Brussels/L=Brussels/O=42Belgium/CN=${DOMAIN_NAME}" \
		-keyout "$TLS_PATH/server.key" -out "$TLS_PATH/server.crt"
fi
