import requests
import psycopg2

try:
    conn = psycopg2.connect(database = "buses", user = "sreekant", password = "", host = "localhost", port = "5432")
    # conn = psycopg2.connect(database = "buses", user = "postgres", password = "HelloPassword@123", host = "139.59.66.152", port = "5432")
except:
    print("Unable to connect to the database") 

cur = conn.cursor()

mac = []
with open('helpline','r') as f:
	for i in range(1,91):
		mac.append(f.readline())

for i in range(len(mac)):
	tam = {}
	tam["location"] = mac[i].split(' - ')[0].strip()
	tam["std_code"] = mac[i].split(' - ')[1].split(' ')[0].strip()
	tam["phone_no_1"] = mac[i].split(' - ')[1].split(' ')[1].strip()
	
	# cur.execute("INSERT INTO helpline_nos (depot_name, phone_no_1) VALUES('{a}','{b}');".format(a=tam["location"], b=tam["std_code"] + " " +tam["phone_no_1"]))
	print("INSERT INTO helpline_nos (depot_name, phone_no_1) VALUES('{a}','{b}');".format(a=tam["location"], b=tam["std_code"] + " " +tam["phone_no_1"]))
	# conn.commit()

	if(len(mac[i].split(' - ')) > 2):
		tam["phone_no_2"] = mac[i].split(' - ')[2][:-1].strip()
		print("UPDATE helpline_nos SET phone_no_2='{a}' where depot_name='{b}';".format(a=tam["std_code"] + " " +tam["phone_no_2"], b=tam["location"]))
		# cur.execute("UPDATE helpline_nos SET phone_no_2='{a}' where depot_name='{b}';".format(a=tam["std_code"] + " " +tam["phone_no_2"], b=tam["location"]))

	# conn.commit()

print("Done!")