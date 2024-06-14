#!/bin/bash
set -eo pipefail

# https://github.com/docker-library/mysql/issues/862
source /usr/local/bin/docker-entrypoint.sh
docker_setup_env mysqld
mysql_socket_fix

# Creates a test database and grants user privileges
if [ -n "$MYSQL_DATABASE" ]; then
  mysql_note "Creating database test_${MYSQL_DATABASE}"
  docker_process_sql --database=mysql <<<"CREATE DATABASE IF NOT EXISTS \`test_$MYSQL_DATABASE\` ;"
fi

if [ -n "$MYSQL_USER" ] && [ -n "$MYSQL_PASSWORD" ]; then
  if [ -n "$MYSQL_DATABASE" ]; then
    mysql_note "Giving user ${MYSQL_USER} access to schema test_${MYSQL_DATABASE}"
    docker_process_sql --database=mysql <<<"GRANT ALL ON \`test_${MYSQL_DATABASE//_/\\_}\`.* TO '$MYSQL_USER'@'%' ;"
  fi
fi
