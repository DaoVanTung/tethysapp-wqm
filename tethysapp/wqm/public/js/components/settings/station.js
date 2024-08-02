

const station_charts = {};

function fill_station_to_table() {
    let data = station_cache;
    console.log(data);


    if (station_table !== null) {
        station_table.destroy();
        station_table = null;
        $('#station-table tbody').off();
    }

    station_table = $('#station-table').DataTable({
        data: data,
        language: {
            zeroRecords: 'Không có kết quả tìm kiếm phù hợp',
            "lengthMenu": "Số điểm quan trắc cho mỗi trang _MENU_",
            "info": "Đang hiển thị _START_ đến _END_ của _TOTAL_ điểm quan trắc",
            "search": "Tìm kiếm",
        },
        dom: '<"top"i>rt<"bottom"flp><"clear">',
        pageLength: 25,
        order: [[2, 'asc']],
        columnDefs: [
            { targets: 0, visible: false },
            { targets: 1, visible: false },
        ],
        columns: [
            {
                data: "ma_tinh",
                title: "Mã tỉnh",
                render: (data, type, row, meta) => {
                    return data;
                },
            },
            {
                data: "cau_hinh_id",
                title: "cau_hinh_id",
                render: (data, type, row, meta) => {
                    if (data) {
                        return 1;
                    }
                    return 0;
                },
            },
            {
                "targets": 0,
                title: "STT",
                width: '50px',
                "render": function (data, type, full, meta) {
                    return meta.row + 1;
                },
            },
            {
                data: "ma_tram",
                title: "Mã trạm",
                width: '160px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "vi_tri",
                title: "Vị trí",
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "diem_khai_thac",
                title: "Điểm khai thác liên quan",
                width: '400px',
                render: (data, type, row, meta) => {
                    let html_text = '';
                    data.forEach(element => {
                        Object.entries(element).forEach(([key, value]) => {
                            html_text += `<li style="text-align: start;">${value}</li>`;

                        });
                    });

                    return `<ul id="wep-${row.id}-render" style="max-height: 190px; overflow-x: auto;">${html_text}</ul>`;
                },
            },
            {
                data: "id",
                title: "Chỉ số WQI 30 ngày gần nhất",
                searchable: false,
                orderable: false,
                width: '400px',
                render: (data, type, row, meta) => {

                    const chart_id = 'chart-' + row.id;
                    if (row['cau_hinh_id'] !== null) {
                        // Lấy dữ liệu 30 ngày
                        $.ajax({
                            url: `/apps/wqm/api/monitoring_station/CB_${row.ma_tram}/wqi/30/`,
                            method: 'GET',
                            success: function (res) {
                                let wqi = {};
                                res['data'].forEach(element => {
                                    let date = element['thoi_gian'].split('T')[0];
                                    wqi[date] = element['gia_tri'];
                                });

                                if (station_charts[chart_id]) {
                                    return;
                                } else {
                                    try {
                                        station_charts[chart_id].destroy();
                                    } catch (e) { }
                                }

                                $(`#chart-container-${chart_id}`).empty();
                                $(`#chart-container-${chart_id}`).append(`<canvas id="${chart_id}"></canvas>`);
                                station_charts[chart_id] = draw_ms_wqi_chart(wqi, chart_id);
                            }
                        });
                    }
                    return `<div id="chart-container-${chart_id}" class="chart-container"></div>`;
                },
            },
            {
                data: "id",
                title: "",
                searchable: false,
                orderable: false,
                width: '96px',
                render: (data, type, row) => {
                    return `
                        <div class='d-flex' style="justify-content: center;">
                            <button type="button" class="btn btn-link" onclick="show_modal_ms_detail('${data}')" data-bs-toggle="modal" data-bs-target="#ms-detail-modal">Chi tiết</button>
                        </div>
                    `;
                },
            },
        ],

    });

    add_filter_station_event();
}

// Thêm sự kiện tìm kiếm
function add_filter_station_event() {
    let search_input = $("#search-station-input");
    if (search_input.length) {
        search_input.on("keyup", function () {
            let search_keyword = search_input.val();
            station_table.search(search_keyword).draw();
        });
    }

    $("#station-province").on('change', function () {
        let province_code = $(this).val();
        if (province_code === "-1") {
            station_table.column(0).search('').draw();
        } else {
            station_table.column(0).search(province_code).draw();
        }
    });

    $("#station-status").on('change', function () {
        let license_status = $(this).val();

        if (license_status === "-1") {
            station_table.column(1).search('').draw();
        } else {
            station_table.column(1).search(license_status).draw();
        }
    });
}

let is_init_add_tab = false;
let active_water_points = [];
let station_configs = [];
let monitoring_parameters_cache = [];

get_active_water_points();
function on_change_station_tab(element_id) {
    $("#content-box__station").addClass('d-none');
    $(`#${element_id}`).removeClass('d-none');

    if (element_id == 'content-box__station-add') {
        if (is_init_add_tab == false) {
            is_init_add_tab = true;

            // Lấy danh sách điểm được giám sát
            // get_active_water_points();

            // Lấy danh sách cấu hình
            get_station_configs();

        } else {
            clear_form();
        }
    } else if (element_id == 'content-box__station-map') {
        station_map.setLayoutProperty('diem_khai_thac_layer', 'visibility', 'none');

        $.ajax({
            url: '/apps/wqm/api/water_exploitation_points/active',
            type: 'GET',
            success: function (res) {
                active_water_points = res['data'];

                let wep_list = [];
                res['data'].forEach(element => {
                    wep_list.push(element['id']);
                });

                station_map.setFilter('diem_khai_thac_layer', ['in', ['get', 'id'], ['literal', wep_list]]);
                station_map.setLayoutProperty('diem_khai_thac_layer', 'visibility', 'visible');

            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    }
}

function get_active_water_points() {
    if (active_water_points.length > 0) {
        return;
    }

    $.ajax({
        url: '/apps/wqm/api/water_exploitation_points/active',
        type: 'GET',
        success: function (res) {
            active_water_points = res['data'];
            res['data'].forEach(element => {
                $("#ms-water-point").append(
                    `
                    <li>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" value="${element.id}" id="ms-${element.id}">
                            <label class="form-check-label" for="ms-${element.id}">
                                ${element.ten_cong_trinh_khai_thac != null ? element.ten_cong_trinh_khai_thac : 'Không xác định'}
                            </label>
                        </div>
                    </li>
                    `
                );

                $("#ms-water-point-modal").append(
                    `
                    <li>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" value="${element.id}" id="ms-modal-${element.id}">
                            <label class="form-check-label" for="ms-modal-${element.id}">
                                ${element.ten_cong_trinh_khai_thac != null ? element.ten_cong_trinh_khai_thac : 'Không xác định'}
                            </label>
                        </div>
                    </li>
                    `
                );
            });

            $('#ms-water-point').off('change');
            $('#search-ms-water-point').off('input');


            $('#ms-water-point').on('change', '.form-check-input', function () {
                var checked_water_point = $('#ms-water-point .form-check-input:checked');

                if (checked_water_point.length > 0) {
                    $("#ms-water-point-text").text(`${checked_water_point.length} điểm khai thác nước đã chọn`);
                } else {
                    $("#ms-water-point-text").text(`Chọn điểm khai thác nước liên kết`);
                }
            });

            $('#search-ms-water-point').on('input', function () {
                var searchValue = $(this).val().toLowerCase();
                $('#ms-water-point li').each(function () {
                    var listItemText = $(this).text().toLowerCase();
                    if (listItemText.indexOf(searchValue) !== -1) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            });
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
}

function get_monitoring_parameters() {
    if (monitoring_parameters_cache.length != 0) {
        return Promise.resolve(); // Trả về một Promise đã được giải quyết ngay lập tức
    }

    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/apps/wqm/api/monitoring_parameters/',
            type: 'GET',
            success: function (res) {
                monitoring_parameters_cache = res['data'];
                resolve(); // Giải quyết Promise khi thành công
            },
            error: function (error) {
                console.error('Error:', error);
                reject(error); // Từ chối Promise khi có lỗi
            }
        });
    });
}

async function get_station_configs() {
    try {
        await get_monitoring_parameters();
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }

    $.ajax({
        url: '/apps/wqm/api/monitoring_station_configs/',
        type: 'GET',
        success: function (res) {
            station_configs = res['data'];

            res['data'].forEach(element => {
                $("#ms-config").append(
                    `
                    <option value="${element.id}">[${element.thoi_gian}] ${element.ten_cau_hinh}</option>
                    `
                );
            });

            $("#ms-config").on('change', function () {
                let config_id = $("#ms-config").val();


                if (config_id == '') {
                    $("#table-params-config").addClass('d-none');
                } else {
                    $("#table-params-config").removeClass('d-none');
                    let config_detail = station_configs.find(obj => obj.id === config_id);
                    let params = config_detail['noi_dung']['thong_so'];

                    $("#table-params-config tbody").empty();

                    params.forEach((param, index) => {
                        let param_info = monitoring_parameters_cache.find(obj => obj.ma_thong_so === param);
                        $("#table-params-config tbody").append(
                            `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${param_info['ma_thong_so']}</td>
                                <td>${param_info['ten_thong_so']}</td>
                                <td>${param_info['don_vi']}</td>
                                <td>${param_info['gia_tri_thap_nhat'] == null ? '' : param_info['gia_tri_thap_nhat']} - ${param_info['gia_tri_cao_nhat'] == null ? '' : param_info['gia_tri_cao_nhat']}</td>
                            </tr>  `
                        );
                    });
                }
            });

        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
}

function on_close_btn_click(element_id) {
    $(`#${element_id}`).addClass('d-none');
    $("#content-box__station").removeClass('d-none');
}

// Lấy mã thông báo CSRF từ cookie
function get_cookie(name) {
    let cookie_value = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Kiểm tra xem cookie có phải là mã thông báo CSRF không
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookie_value = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookie_value;
}

function clear_form() {
    // Xóa tất cả các trường nhập liệu
    $('#add-ms-form').find('input[type="text"], input[type="number"], select').val('');

    // Xóa tất cả các checkbox
    $('#add-ms-form').find('input[type="checkbox"]').prop('checked', false);

    // Đặt giá trị mặc định cho các select nếu cần
    $('#ms-province').val('80');  // Ví dụ: đặt về giá trị mặc định của tỉnh
    $('#ms-type').val('Quan trắc nước mặt'); // Ví dụ: đặt về giá trị mặc định của loại trạm
    $('#ms-config').val(''); // Ví dụ: đặt về giá trị mặc định của cấu hình
    $("#ms-water-point-text").text(`Chọn điểm khai thác nước liên kết`);
    $("#table-params-config").addClass(`d-none`);
}

function generate_UUID() {
    // Tạo UUID version 4 ngẫu nhiên
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

$('#add-ms-form').on('submit', function (event) {
    event.preventDefault(); // Ngăn chặn việc submit form mặc định

    $("#content-box__station-add").addClass('d-none');
    $("#station-loading-box").removeClass('d-none');

    const url = '/apps/wqm/api/monitoring_station/';
    const form_data = new FormData();

    // Mã trạm
    let id = generate_UUID();
    let station_code = $("#ms-code").val().trim();
    let station_number = $("#ms-number").val().trim();
    let station_long = parseFloat($("#ms-long").val().trim());
    let station_lat = parseFloat($("#ms-lat").val().trim());
    let station_location = $("#ms-location").val().trim();
    let station_province = parseInt($("#ms-province").val().trim());
    let station_type = $("#ms-type").val().trim();
    let station_config = $("#ms-config").val().trim();
    let link_water_points = $('#ms-water-point input[type="checkbox"]:checked').map(function () {
        return this.value;
    }).get();


    let data = {
        id: id,
        ma_tram: station_code,
        so_hieu: station_number,
        kinh_do: station_long,
        vi_do: station_lat,
        vi_tri: station_location,
        ma_tinh: station_province,
        loai_tram: station_type,
        cau_hinh_id: station_config,
        diem_khai_thac: link_water_points,
    };

    if (station_config !== '') {
        data[cau_hinh_id] = station_config;
    }

    form_data.append(
        "data",
        JSON.stringify(data)
    );

    $.ajax({
        url: url,
        type: 'POST',
        data: form_data,
        headers: {
            'X-CSRFToken': get_cookie('csrftoken') // Thêm mã thông báo CSRF vào header
        },
        processData: false,
        contentType: false,
        cache: false,
        enctype: "multipart/form-data",

        success: function (data) {
            $("#content-box__station-add").removeClass('d-none');
            $("#station-loading-box").addClass('d-none');
            clear_form();
        },
        error: function (error) {
            console.error('Error:', error);
            $("#content-box__station-add").removeClass('d-none');
            $("#station-loading-box").addClass('d-none');

        }
    });
});

function show_modal_ms_detail(ms_id) {
    const ms_data = station_cache.find(obj => obj.id === ms_id);

    $('#ms-detail-modal tbody').empty();
    $('#ms-detail-modal').removeClass('d-none');

    // Tạo thẻ tr mới
    var newRow = $('<tr>');
    newRow.append('<td>Mã trạm</td>');
    newRow.append(`<td>${ms_data.ma_tram}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Số hiệu</td>');
    newRow.append(`<td>${ms_data.so_hieu}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Vị trí</td>');
    newRow.append(`<td>${ms_data.vi_tri}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Kinh độ</td>');
    newRow.append(`<td>${ms_data.kinh_do} </td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Vĩ độ</td>');
    newRow.append(`<td>${ms_data.vi_do} </td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Loại trạm</td>');
    newRow.append(`<td>${ms_data.loai_tram}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    var trang_thai = ms_data.cau_hinh_id ? 'Đang hoạt động' : 'Không hoạt động';
    newRow.append('<td>Trạng thái</td>');
    newRow.append(`<td>${trang_thai} </td>`);
    $('#ms-detail-modal tbody').append(newRow);
    $('#ms-water-point-modal input[type="checkbox"]').prop('checked', false);

    let init_checked_value = [];
    ms_data.diem_khai_thac.forEach(element => {
        Object.entries(element).forEach(([key, value]) => {
            init_checked_value.push(key);
            $(`#ms-water-point-modal #ms-modal-${key}`).prop('checked', true);
        });
    });

    $("#update-ms-data").addClass('d-none');
    $("#update-ms-data").off('click');

    $("#update-ms-data").on('click', function () {

        let checkboxData = [];

        $(`#wep-${ms_data.id}-render`).empty();
        $('#ms-water-point-modal input[type="checkbox"]').each(function () {
            let checkboxId = $(this).attr('id');
            let label = $('label[for="' + checkboxId + '"]').text().trim();
            checkboxData.push({ id: checkboxId, label: label });

            $(`#wep-${ms_data.id}-render`).append(
                `
                    <li style="text-align: start;">${label}</li>
                `
            );

        });
        ms_data.diem_khai_thac = checkboxData;

        let link_water_points = $('#ms-water-point-modal input[type="checkbox"]:checked').map(function () {
            return this.value;
        }).get();

        let update_data = {
            id: ms_data.id,
            diem_khai_thac: link_water_points,
        }

        const form_data = new FormData();
        form_data.append(
            "data",
            JSON.stringify(update_data)
        );

        // Gọi api cập nhật
        $.ajax({
            url: '/apps/wqm/api/update_monitoring_station/',
            type: 'POST',
            data: form_data,
            headers: {
                'X-CSRFToken': get_cookie('csrftoken')
            },
            processData: false,
            contentType: false,
            cache: false,
            enctype: "multipart/form-data",
            success: function (res) {
                console.log(res);
            },
        });

        $("#update-ms-data").addClass('d-none');

    });

    $('#ms-water-point-modal input[type="checkbox"]').off('change');
    $('#ms-water-point-modal input[type="checkbox"]').on('change', function () {
        let checkedValues = [];

        $('#ms-water-point-modal input[type="checkbox"]:checked').each(function () {
            checkedValues.push($(this).val());
        });

        if (arrays_equal(checkedValues, init_checked_value)) {
            $("#update-ms-data").addClass('d-none');
        } else {
            $("#update-ms-data").removeClass('d-none');
        }
    });


    draw_ms_detail_chart(ms_data.ma_tram, 7, 'wqi-detail-chart');

    $('#ms-detail-time-step').off('change');

    $("#ms-detail-time-step").on('change', function () {
        let day = $("#ms-detail-time-step").val();
        draw_ms_detail_chart(ms_data.ma_tram, day, 'wqi-detail-chart');
    });
}

function arrays_equal(arr1, arr2) {
    // Kiểm tra độ dài của hai mảng
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Sắp xếp hai mảng để so sánh
    arr1.sort();
    arr2.sort();

    // So sánh từng phần tử
    return arr1.every((value, index) => value === arr2[index]);
}

var ms_wqi_detail_chart;
var temp_ms_data;
function draw_ms_detail_chart(ms_code, day, element_id) {
    $.ajax({
        url: `/apps/wqm/api/monitoring_station/CB_${ms_code}/wqi/${day}/`,
        method: 'GET',
        success: function (res) {
            let wqi = {};
            res['data'].forEach(element => {
                let date = element['thoi_gian'].split('T')[0];
                wqi[date] = element['gia_tri'];
            });

            // let lastElement = res['data'][res['data'].length - 1];
            // $("#license-wqi-text").text(lastElement['gia_tri']);

            try {
                ms_wqi_detail_chart.destroy();
            } catch (e) { }

            ms_wqi_detail_chart = draw_ms_wqi_chart(wqi, element_id);
            temp_ms_data = wqi;
        }
    });
}

function show_ms_map_info(properties) {

    $(`#station-point-map-info tbody`).empty();
    $(`#station-point-map-info .analysis-data`).empty();
    $(`#station-point-map-info`).removeClass(`d-none`);
    $(`#station-point-map-info #station-point-map-title`).text(`Thông tin điểm quan trắc`);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Mã trạm</td>`);
    newRow.append(`<td>${properties.ma_tram !== undefined ? properties.ma_tram : ''}</td>`);
    $(`#station-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Số hiệu</td>`);
    newRow.append(`<td>${properties.so_hieu !== undefined ? properties.so_hieu : ''}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Vị trí</td>`);
    newRow.append(`<td>${properties.vi_tri !== undefined ? properties.vi_tri : ''}</td>`);
    $(`#station-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Kinh độ</td>`);
    newRow.append(`<td>${properties.kinh_do !== undefined ? properties.kinh_do : ''}</td>`);
    $(`#station-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Vĩ độ</td>`);
    newRow.append(`<td>${properties.vi_do !== undefined ? properties.vi_do : ''}</td>`);
    $(`#station-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Loại trạm</td>`);
    newRow.append(`<td>${properties.loai_tram !== undefined ? properties.loai_tram : ''}</td>`);
    $(`#station-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Trạng thái</td>`);
    newRow.append(`<td>${properties.cau_hinh_id ? 'Hoạt động' : 'Ngưng hoạt động'}</td>`);
    $(`#station-point-map-info tbody`).append(newRow);

    $("#station-point-map-info .analysis-data").append(`
        <div style="display: flex; justify-content: space-between;">
            <p class="mb-2 mt-2">Chỉ số chất lượng nước hiện tại: <b id="station-wqi-text"></b></p>
            <select id="station-point-data-time-step" class="form-control" style="height: 32px; width: auto; border-radius: 0;">
                <option value="7" selected>7 ngày</option>
                <option value="30">30 ngày</option>
                <option value="90">3 tháng</option>
                <option value="180">6 tháng</option>
                <option value="365">1 năm</option>
            </select>
        </div>    
    `);

    $("#station-point-data-time-step").on('change', function () {
        let day = $("#station-point-data-time-step").val();
        draw_ms_detail_chart(properties.ma_tram, day, 'station-wqi-chart');
    });

    $("#station-point-map-info .analysis-data").append('<canvas id="station-wqi-chart"></canvas>');

    draw_ms_detail_chart(properties.ma_tram, 7, 'station-wqi-chart');
}

function add_station_map_click_event(station_map) {
    station_map.on("click", function (e) {
        var features = station_map.queryRenderedFeatures(e.point, { layers: ["diem_khai_thac_layer"] });
        if (!features.length) {
            return;
        }

        var properties = features[0].properties;
        show_water_point_info('station', properties);
    });

    station_map.on("click", function (e) {
        var features = station_map.queryRenderedFeatures(e.point, { layers: ["diem_quan_trac_layer"] });
        if (!features.length) {
            return;
        }

        var properties = features[0].properties;
        show_ms_map_info(properties);
    });
}

$("#export-ms-data").on('click', function () {
    export_data_to_csv(temp_ms_data);
});

function export_data_to_csv(data) {
    const csv_rows = [];

    csv_rows.push('Date,Value');

    for (const [key, value] of Object.entries(data)) {
        csv_rows.push(`${key},${value}`);
    }

    const csv = csv_rows.join('\n');

    // Tạo một đối tượng Blob từ chuỗi CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Tạo liên kết tải xuống
    const link = $('<a></a>');
    const url = URL.createObjectURL(blob);
    link.attr('href', url);
    link.attr('download', 'data.csv');
    link.css('visibility', 'hidden');
    $('body').append(link);
    link[0].click();
    link.remove();
}