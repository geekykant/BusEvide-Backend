#!/bin/bash

DB_DUMP_LOCATION="/tmp/psql_data/busevide_data.sql"

echo "*** CREATING DATABASE ***"

PGPASSWORD=1Stepclose psql -U snowflake -d busevide < "$DB_DUMP_LOCATION";

echo "*** DATABASE CREATED! ***"