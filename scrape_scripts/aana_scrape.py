import requests
from bs4 import BeautifulSoup
from multiprocessing import Pool
import multiprocessing

import psycopg2

#1-25000 (done)

try:
    conn = psycopg2.connect(database = "buses", user = "sreekant", password = "", host = "localhost", port = "5432")
except:
    print("Unable to connect to the database") 

url = "https://www.aanavandi.com/search/route/id/"
all_urls = list()

mac = []
cur = conn.cursor()
cur.execute("SELECT bus_code from bus_list order by bus_code asc;")
rowss = cur.fetchall()
for row in rowss:
    mac.append(int(row[0]))

# print(mac)

def do_scrape(content, b_id):
    soup = BeautifulSoup(content, 'lxml')

    route_name = soup.find('h1',{'class':'textupper'}).text.strip()
    bus_type = soup.find('b').text
    via_route = soup.find('small').text.split('Via ')[-1]

    if("'" in via_route):
        via_route = via_route.replace("'","")

    sched_table = soup.find('div',{'id':'schedule-grid'}).find('tbody')

    from_location = route_name.split('-')[0].strip()
    to_location = route_name.split('-')[-1].strip()

    pt_timing = []
    table_rows_l = len(sched_table.find_all('tr'))
    for i in range(table_rows_l):
        row = sched_table.find_all('tr')[i]
        pt = [row.find_all('td')[0].text,row.find_all('td')[1].text]
        pt_timing.append(pt)

    try:
        cur.execute("CREATE TABLE IF NOT EXISTS route_{b_id} (bus_stop text, stop_timing text);".format(b_id=b_id))

        for item in pt_timing:
            cur.execute("INSERT INTO route_{b_id} (bus_stop,stop_timing) VALUES('{a}','{b}');"
                .format(b_id=b_id, a=item[0], b=item[1]))
        
        cur.execute("INSERT INTO bus_list (route_name,bus_type,via_route,bus_code,from_location,to_location) VALUES('{a}','{b}','{c}','{d}','{e}','{f}');"
            .format(a=route_name, b=bus_type, c=via_route, d=b_id, e=from_location, f=to_location))

        conn.commit()
    except Exception as e: 
        print(e)
        print("Can't create table {b_id}!".format(b_id=b_id))

def scrape_data(url):
    b_id = url.split('/')[-1]

    r = requests.get(url)
    # print(url)
    # print("{b_id}:{a}".format(b_id=b_id,a=len(r.content)))
    # if(len(r.content)<13500 and len(r.content)>13300):
    #     print("{b_id}:{a}".format(b_id=b_id,a=len(r.content)))

    if(r.status_code==200 and len(r.content)>13300):
        print(f"Working on id:{b_id}")
        do_scrape(r.content, b_id)
    # else:
    #     print(f"Not found at id:{b_id}")

for id in range(0,50000):
    if(id not in mac):
        all_urls.append(url + str(id))


if __name__ == '__main__':
    with multiprocessing.Pool(processes=50) as p:   
        result = p.map(scrape_data, all_urls)
    print("-----COMPLETED-----")
    conn.close()
    cur.close()

# p = Pool(50)
# p.map(scrape_data, all_urls)
# print("-----COMPLETED-----")

# p.terminate()
# p.join()

# conn.close()
# cur.close()