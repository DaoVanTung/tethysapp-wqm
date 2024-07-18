import psycopg2
from django.http import JsonResponse
from tethys_sdk.routing import controller

HOST = '10.0.200.66'
DB_NAME = 'wqm'
USERNAME = 'postgres'
PASSWORD = 'Tecotec@2023#66'


@controller(url='/api/licenses')
def get_licenses(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute('SELECT * FROM public.giay_phep_tai_nguyen_nuoc ')

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()
        # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # print(result_list)
    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})