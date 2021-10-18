FROM postgres:alpine

RUN mkdir -p /tmp/psql_data/

COPY db/busevide_data.sql /tmp/psql_data/
COPY scripts/init_docker_postgres.sh /docker-entrypoint-initdb.d/