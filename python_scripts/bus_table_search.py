import requests
import psycopg2

try:
    conn = psycopg2.connect(database = "buses", user = "sreekant", password = "", host = "localhost", port = "5432")
except:
    print("Unable to connect to the database") 

cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name LIKE '%route_%';")

tables_list = []

tabless = cur.fetchall()
for table in tabless:
	tables_list.append(table[0])

# print(tables_list)

# from_location = "Ernakulam"
# to_location = "Kollam"

# print(len(tables_list))
# exit(0)

#psql -U sreekant -d buses -a -f myInsertFile

# for i in tables_list[40000:]:
# 	cur.execute("SELECT * FROM " + i + ";")

# 	# cur.execute("SELECT * FROM " + table_item + " WHERE EXISTS(SELECT 1 FROM " + table_item + " WHERE bus_stop LIKE '%" + from_location + "%');")
# 	result = cur.fetchall()
# 	row_val = ""
# 	for rr in result:
# 		row_val += rr[0].strip() + " - "
# 	# print(row_val[:-2])

# 	print("UPDATE bus_list SET bus_route='" + row_val[:-2].strip() + "' WHERE bus_code='" + str(i.replace("route_","")) + "' ;")
# 	# cur.execute("UPDATE bus_list SET bus_route='" + row_val[:-2].strip() + "' WHERE bus_code='" + str(i.replace("route_","")) + "' ;")
# 	# print("done for: " + tables_list[i] )

mac = []
with open('/Users/sreekant/Desktop/qr.csv','r') as f:
	f.readline()
	for i in range(2181):
		mac.append(str(f.readline()).replace("\\n","").strip())

# print(mac)

for item in mac:
	cur.execute("INSERT INTO bus_locations (bus_stops) VALUES('" + item.strip() + "');")
	conn.commit()

# for i in tables_list[:]:
# 	cur.execute("SELECT * FROM " + i + ";")

# 	# cur.execute("SELECT * FROM " + table_item + " WHERE EXISTS(SELECT 1 FROM " + table_item + " WHERE bus_stop LIKE '%" + from_location + "%');")
# 	result = cur.fetchall()
# 	row_val = ""
# 	for rr in result:
# 		row_val += rr[0].strip() + " - "
# 		# cur.execute("INSERT INTO bus_locations (bus_stops) VALUES('" + rr[0].strip() + "');")
# 		conn.commit()
	# print(row_val[:-2])

	# print("UPDATE bus_list SET bus_route='" + row_val[:-2].strip() + "' WHERE bus_code='" + str(i.replace("route_","")) + "' ;")
	# cur.execute("UPDATE bus_list SET bus_route='" + row_val[:-2].strip() + "' WHERE bus_code='" + str(i.replace("route_","")) + "' ;")
	# print("done for: " + tables_list[i] )

