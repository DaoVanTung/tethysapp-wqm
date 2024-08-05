import json
import psycopg2
from django.http import JsonResponse
from tethys_sdk.routing import controller
from django.views.decorators.csrf import csrf_exempt
import uuid

# Thông tin kết nối đến csdl
HOST = '10.0.200.60'
DB_NAME = 'wqm'
USERNAME = 'postgres'
PASSWORD = 'Tecotec@MKDC#2023'

# Thông tin kết nối đến csdl data cảm biến
HOST_SENSOR_DB = '10.0.200.60'
DB_NAME_SENSOR_DB = 'wqm_station_data'
USERNAME_SENSOR_DB = 'postgres'
PASSWORD_SENSOR_DB = 'Tecotec@MKDC#2023'

@controller(url='/api/licenses')
def get_licenses(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute('SELECT * FROM public.giay_phep_tai_nguyen_nuoc ORDER BY so_hieu_van_ban ASC, so_luong_diem_khai_thac ASC')

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
def get_wep_of_license(request, id):
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


@controller(url='/api/water_exploitation_points/active')
def get_water_exploitation_points_active(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.diem_khai_thac_nuoc WHERE giay_phep_tai_nguyen_nuoc_id in (SELECT id FROM public.giay_phep_tai_nguyen_nuoc WHERE giam_sat = true) ORDER BY ten_cong_trinh_khai_thac ASC")

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

@controller(url='/api/license/{id}/monitoring_stations')
def get_ms_of_license(request, id):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.lien_ket_diem_quan_trac_diem_khai_thac WHERE diem_khai_thac_id in (SELECT id FROM public.diem_khai_thac_nuoc WHERE giay_phep_tai_nguyen_nuoc_id = '{id}')")

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
def get_ms(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.diem_quan_trac ORDER BY cau_hinh_id ASC, ma_tram ASC")

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # Lấy danh sách 

    cur.execute(f"SELECT diem_quan_trac_id, diem_khai_thac_id, ten_cong_trinh_khai_thac FROM public.lien_ket_diem_quan_trac_diem_khai_thac INNER join diem_khai_thac_nuoc on lien_ket_diem_quan_trac_diem_khai_thac.diem_khai_thac_id = diem_khai_thac_nuoc.id")
    lk = cur.fetchall()
    
    for item in result_list:
        diem_khai_thac = [{dkt[1]: dkt[2]} for dkt in lk if dkt[0] == item['id']]
        item['diem_khai_thac'] = diem_khai_thac

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'data': result_list})



@controller(url='/api/monitoring_stations/active')
def get_ms_active(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.diem_quan_trac WHERE cau_hinh_id is not null")

    # Lấy tất cả các dòng kết quả
    rows = cur.fetchall()

    # Lấy tên các cột
    colnames = [desc[0] for desc in cur.description]

    # Chuyển đổi dữ liệu thành danh sách các từ điển
    result_list = [dict(zip(colnames, row)) for row in rows]

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()
    

    # Lấy thêm dữ liệu quan trắc 30 ngày gần đây
    conn = psycopg2.connect(dbname=DB_NAME_SENSOR_DB, user=USERNAME_SENSOR_DB, password=PASSWORD_SENSOR_DB, host=HOST_SENSOR_DB)
    cur = conn.cursor()

    for item in result_list:
        cur.execute(f"SELECT thoi_gian, gia_tri FROM public.ket_qua_tinh_toan WHERE thong_so = 'WQI' AND ma_cam_bien = 'CB_{item['ma_tram']}' AND thoi_gian >= NOW() - INTERVAL '30 days' ORDER BY thoi_gian ASC")
        du_lieu_quan_trac = cur.fetchall()
        item['du_lieu_quan_trac'] = du_lieu_quan_trac

    return JsonResponse({'data': result_list})


@controller(url='/api/monitoring_station_configs')
def get_ms_config(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.cau_hinh_cam_bien ORDER BY thoi_gian DESC")

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



@controller(url='/api/monitoring_parameters')
def get_monitoring_parameters(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.thong_so_quan_trac")

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

def generate_random_uuid():
    # Tạo UUID ngẫu nhiên
    new_uuid = uuid.uuid4()
    return str(new_uuid)

@csrf_exempt
@controller(url='/api/monitoring_station', method='POST')
def add_ms(request):
    # Kết nối đến cơ sở dữ liệu
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    data = {}
    try:
        data = json.loads(request.POST['data'])
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Lấy dữ liệu từ JSON
    id = data.get('id')
    ma_tram = data.get('ma_tram')
    so_hieu = data.get('so_hieu')
    kinh_do = data.get('kinh_do')
    vi_do = data.get('vi_do')
    vi_tri = data.get('vi_tri')
    ma_tinh = data.get('ma_tinh')
    cau_hinh_id = data.get('cau_hinh_id')
    diem_khai_thac = data.get('diem_khai_thac')

    print(diem_khai_thac)

    # Kiểm tra nếu tất cả các trường cần thiết đều có
    # if not all([ma_tram, so_hieu, kinh_do, vi_do, vi_tri, ma_tinh, cau_hinh_id]):
    #     return JsonResponse({'error': 'Missing required fields'}, status=400)

    # Xây dựng câu truy vấn SQL để chèn dữ liệu
    query = """
        INSERT INTO public.diem_quan_trac (id, ma_tram, so_hieu, kinh_do, vi_do, vi_tri, ma_tinh, cau_hinh_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (id, ma_tram, so_hieu, kinh_do, vi_do, vi_tri, ma_tinh, cau_hinh_id)

    try:
        # Thực hiện truy vấn
        cur.execute(query, values)
        conn.commit()  # Xác nhận thay đổi trong cơ sở dữ liệu
    except psycopg2.Error as e:
        conn.rollback()  # Hoàn tác nếu có lỗi
        cur.close()
        conn.close()
        return JsonResponse({'error': f'Error inserting data: {e}'}, status=500)
    
    for item in diem_khai_thac:
        cur.execute(f"INSERT INTO public.lien_ket_diem_quan_trac_diem_khai_thac VALUES('{id}', '{item}')")
        conn.commit()  # Xác nhận thay đổi trong cơ sở dữ liệu

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'message': 'Monitoring station added successfully'})



@csrf_exempt
@controller(url='/api/update_monitoring_station', method='POST')
def update_ms(request):
    # Kết nối đến cơ sở dữ liệu
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    data = {}
    try:
        data = json.loads(request.POST['data'])
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Lấy dữ liệu từ JSON
    id = data.get('id')
    diem_khai_thac = data.get('diem_khai_thac')

    cur.execute(f"DELETE FROM public.lien_ket_diem_quan_trac_diem_khai_thac WHERE diem_quan_trac_id = '{id}'")
    conn.commit()  # Xác nhận thay đổi trong cơ sở dữ liệu

    for item in diem_khai_thac:
        cur.execute(f"INSERT INTO public.lien_ket_diem_quan_trac_diem_khai_thac VALUES('{id}', '{item}')")
        conn.commit()  # Xác nhận thay đổi trong cơ sở dữ liệu

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'message': 'Monitoring station update successfully'})


@controller(url='/api/monitoring_station/{sensor_code}/wqi/{day}')
def get_ms_wqi_data(request, sensor_code, day):
    conn = psycopg2.connect(dbname=DB_NAME_SENSOR_DB, user=USERNAME_SENSOR_DB, password=PASSWORD_SENSOR_DB, host=HOST_SENSOR_DB)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.ket_qua_tinh_toan WHERE thong_so = 'WQI' AND ma_cam_bien = '{sensor_code}' AND thoi_gian >= NOW() - INTERVAL '{day} days' ORDER BY thoi_gian ASC")

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


@controller(url='/api/water_station/{sensor_code}/wl/{day}')
def get_wl_data(request, sensor_code, day):
    conn = psycopg2.connect(dbname=DB_NAME_SENSOR_DB, user=USERNAME_SENSOR_DB, password=PASSWORD_SENSOR_DB, host=HOST_SENSOR_DB)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.ket_qua_tinh_toan WHERE thong_so = 'WF' AND ma_cam_bien = '{sensor_code}' AND thoi_gian >= NOW() - INTERVAL '{day} days' ORDER BY thoi_gian ASC")

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

@controller(url='/api/monitoring_station/{id}/water_exploitation_points')
def get_wep_of_ms(request, id):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.diem_khai_thac_nuoc WHERE id in (SELECT diem_khai_thac_id FROM public.lien_ket_diem_quan_trac_diem_khai_thac WHERE diem_quan_trac_id = '{id}')")

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

@controller(url='/api/wqi_lookup', method='GET')
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


@csrf_exempt
@controller(url='/api/update_wqi_lookup/', method='POST')
def update_wqi_lookup(request):
    # Kết nối đến cơ sở dữ liệu
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    data = {}
    try:
        data = json.loads(request.POST['data'])
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    for key in data:
        value = data.get(key)
        try:
            cur.execute(f"UPDATE public.bang_tra_cuu_wqi SET mo_ta = '{value.get('mo_ta')}', mau_sac = '{value.get('mau_sac')}' WHERE id = {key}")
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()
            cur.close()
            conn.close()
            return JsonResponse({'error': f'Error inserting data: {e}'}, status=500)

    # Đóng kết nối và cursor sau khi hoàn thành
    cur.close()
    conn.close()

    return JsonResponse({'message': 'Successfully'})

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

# Lấy danh sách cấu hình email

@controller(url='/api/email_config')
def get_email_config(request):
    conn = psycopg2.connect(dbname=DB_NAME, user=USERNAME, password=PASSWORD, host=HOST)
    cur = conn.cursor()

    cur.execute(f"SELECT * FROM public.cau_hinh_thong_bao ORDER BY id ASC")

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