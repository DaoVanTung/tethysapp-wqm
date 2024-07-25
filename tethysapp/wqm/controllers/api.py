import psycopg2
from django.http import JsonResponse
from tethys_sdk.routing import controller

HOST = '10.0.200.60'
DB_NAME = 'wqm'
USERNAME = 'postgres'
PASSWORD = 'Tecotec@MKDC#2023'

@controller(url='/api/licenses')
def get_licenses(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute('SELECT * FROM public.giay_phep_tai_nguyen_nuoc')

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # cur.execute('SELECT giay_phep_tai_nguyen_nuoc_id, COUNT(*) FROM public.diem_khai_thac_nuoc GROUP BY giay_phep_tai_nguyen_nuoc_id')

    # rows = cur.fetchall()

    # for result in result_list:
    #     row_data = next((doc for doc in rows if doc[0] == result['id']), None)
    #     if row_data is None:
    #         result['so_luong_diem_khai_thac'] = 0
    #     else:
    #         result['so_luong_diem_khai_thac'] = row_data[1]

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})



@controller(url='/api/licenses/number_water_exploitation_points')
def get_licenses(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute('SELECT giay_phep_tai_nguyen_nuoc_id, COUNT(*) FROM public.diem_khai_thac_nuoc GROUP BY giay_phep_tai_nguyen_nuoc_id')

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]
    
    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})


@controller(url='/api/licenses/{id}/water_exploitation_points')
def get_license_water_exploitation_points(request, id):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.diem_khai_thac_nuoc WHERE giay_phep_tai_nguyen_nuoc_id = '{id}'")

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})

@controller(url='/api/monitoring_stations')
def get_monitoring_stations(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.diem_quan_trac LIMIT 14")

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})



@controller(url='/api/wqi_lookup')
def get_wqi_lookup(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.bang_tra_cuu_wqi ORDER BY gia_tri_thap_nhat ASC")

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})


@controller(url='/api/parameters')
def get_parameters(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.thong_so_quan_trac ORDER BY nhom_thong_so ASC")

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})