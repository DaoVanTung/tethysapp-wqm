let today = new Date();
let next_30_day = new Date();
next_30_day.setDate(today.getDate() + 30);

function analysis_licenses() {
    license_cache.forEach(element => {
        let end_date = new Date(Date.parse(element['ngay_het_han']));

        if (end_date < today) {
            license_expired += 1;
        } else if (end_date > today && end_date < next_30_day) {
            license_expiring_soon += 1;
        } else {
            license_valid += 1;
        }
    });

    $('#license-total').text(license_total.toLocaleString());
    $('#license-valid').text(license_valid.toLocaleString());
    $('#license-expiring-soon').text(license_expiring_soon.toLocaleString());
    $('#license-expired').text(license_expired.toLocaleString());
}


function fill_licenses_to_table() {
    let data = license_cache;

    if (license_table !== null) {
        license_table.destroy();
        license_table = null;
        $('#license-table tbody').off();
    }

    license_table = $('#license-table').DataTable({
        data: data,
        language: {
            zeroRecords: 'Không có kết quả tìm kiếm phù hợp',
            "lengthMenu": "Số giấy phép cho mỗi trang _MENU_",
            "info": "Đang hiển thị _START_ đến _END_ của _TOTAL_ giấy phép",
            "search": "Tìm kiếm",
            "infoEmpty": "Không có giấy phép nào được hiển thị",
            "infoFiltered": "(được lọc từ tổng số _MAX_ giấy phép)"
        },
        searching: true,
        dom: '<"top"i>rt<"bottom"flp><"clear">',
        pageLength: 10,
        order: [[3, 'asc']],
        columnDefs: [
            { targets: 0, visible: false },
            { targets: 1, visible: false },
            { targets: 2, visible: false },
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
                data: "ngay_het_han",
                title: "Trạng thái",
                render: (data, type, row, meta) => {
                    if (data == null) return "1";

                    let end_date = new Date(Date.parse(data));
                    if (end_date < today) {
                        return "0";
                    }

                    return "1";
                },
            },
            {
                data: "giam_sat",
                title: "Trạng thái giám sát",
                render: (data, type, row, meta) => {
                    if (data === true) {
                        return "1";
                    }

                    return "0";
                },
            },
            {
                "targets": 0,
                title: "STT",
                "render": function (data, type, full, meta) {
                    return meta.row + 1;
                }
            },
            {
                data: "so_hieu_van_ban",
                title: "Số hiệu văn bản",
                width: '180px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "ngay_ban_hanh",
                title: "Ngày ban hành",
                width: '150px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    let datetime = new Date(Date.parse(data));
                    return datetime.toLocaleDateString("vi-VN");
                },
            },
            {
                data: "ngay_het_han",
                title: "Ngày hết hạn",
                width: '150px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    let end_date = new Date(Date.parse(data));

                    if (end_date < today) {
                        return `
                        <span style="color: #dc3545;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-excel-fill" viewBox="0 0 16 16">
                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64"/>
                        </svg>
                        ${end_date.toLocaleDateString("vi-VN")}
                        
                        </span>`;
                    } else if (end_date > today && end_date < next_30_day) {
                        return `<span style="color: #ffc107;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                        </svg>
                        ${end_date.toLocaleDateString("vi-VN")}
                        </span>`;
                    } else {
                        return `<span style="color: green;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-check-fill" viewBox="0 0 16 16">
                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m1.354 4.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
                        </svg>
                        ${end_date.toLocaleDateString("vi-VN")}
                        </span>`;
                    }
                },
            },
            {
                data: "loai_giay_phep",
                title: "Loại giấy phép",
                width: '280px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    return data;
                },
            },
            {
                data: "ten_to_chuc_ca_nhan",
                title: "Tên tổ chức/cá nhân",
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "so_luong_diem_khai_thac",
                title: "Điểm khai thác",
                width: '160px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "id",
                title: "",
                width: '100px',
                searchable: false,
                orderable: false,
                render: (data, type, row) => {
                    if (row['so_luong_diem_khai_thac'] < 1) {
                        return "";
                    }
                    return `
                    <div class='d-flex' style="justify-content: center;">
                        <button type="button" class="btn btn-link" onclick="on_view_license_button_click('${data}')">Chi tiết</button>
                    </div>
                    `;
                },
            },
        ]
    });

    add_filter_license_event();
}

// Thêm sự kiện tìm kiếm
function add_filter_license_event() {
    let search_input = $("#search-licene-input");
    if (search_input.length) {
        search_input.on("keyup", function () {
            let search_keyword = search_input.val();
            license_table.search(search_keyword).draw();
        });
    }

    $("#license-province").on('change', function () {
        let province_code = $(this).val();
        if (province_code === "-1") {
            license_table.column(0).search('').draw();
        } else {
            license_table.column(0).search(province_code).draw();
        }
    });

    $("#license-status").on('change', function () {
        let license_status = $(this).val();

        if (license_status === "-1") {
            license_table.column(1).search('').draw();
        } else {
            license_table.column(1).search(license_status).draw();
        }
    });

    $("#license-monitor").on('change', function () {
        if ($(this).is(':checked')) {
            license_table.column(2).search('1').draw();
        } else {
            license_table.column(2).search('').draw();
        }
    });
}

function on_view_license_button_click(license_id) {
    $('#content-box__license').addClass('d-none');
    $('#content-box__license-detail').removeClass('d-none');

    // Thêm và áp dụng filter để lọc điểm khai thác của license_id
    license_map.setFilter('diem_khai_thac_layer', ['==', ['get', 'giay_phep_tai_nguyen_nuoc_id'], license_id]);

    license_map.setLayoutProperty('diem_quan_trac_layer', 'visibility', 'none');

    // Lấy danh sách điểm quan trắc liên kết với điểm khai thác này
    $.ajax({
        url: `/apps/wqm/api/license/${license_id}/monitoring_stations`,
        method: 'GET',
        success: function (res) {
            let ms_list = [];
            res['data'].forEach(element => {
                ms_list.push(element['diem_quan_trac_id']);
            });

            license_map.setFilter('diem_quan_trac_layer', ['in', ['get', 'id'], ['literal', ms_list]]);
            license_map.setLayoutProperty('diem_quan_trac_layer', 'visibility', 'visible');

        }
    });

    $('#point-data').addClass('d-none');

    // Lấy thông tin giấy phép
    const license_data = license_cache.find(obj => obj.id === license_id);

    // Điền vào bảng
    $("#license-so-hieu").text(license_data["so_hieu_van_ban"]);
    $("#license-ngay-ban-hanh").text(license_data["ngay_ban_hanh"]);
    $("#license-ngay-het-han").text(license_data["ngay_het_han"]);
    $("#license-loai-giay-phep").text(license_data["loai_giay_phep"]);
    $("#license-ten-to-chuc").text(license_data["ten_to_chuc_ca_nhan"]);
    $("#license-diem-khai-thac").text(license_data["so_luong_diem_khai_thac"]);

    if (license_data["giam_sat"]) {
        $("#license-giam-sat").text('Đang giám sát');
    } else {
        $("#license-giam-sat").html('<a href="#">Giám sát</a>');
    }

}

function on_close_license_detail_click() {
    $('#content-box__license').removeClass('d-none');
    $('#content-box__license-detail').addClass('d-none');
}


function add_license_map_click_event(license_map) {
    license_map.on("click", function (e) {
        var features = license_map.queryRenderedFeatures(e.point, { layers: ["diem_khai_thac_layer"] });
        if (!features.length) {
            return;
        }
    
        var properties = features[0].properties;
        show_water_point_info('license', properties);
    });
    
    license_map.on("click", function (e) {
        var features = license_map.queryRenderedFeatures(e.point, { layers: ["diem_quan_trac_layer"] });
        if (!features.length) {
            return;
        }
    
        var properties = features[0].properties;
        show_ms_info(properties);
    });
}

function show_water_point_info(tab_name, properties) {
    $(`#${tab_name}-point-map-info tbody`).empty();
    $(`#${tab_name}-point-map-info .analysis-data`).empty();
    $(`#${tab_name}-point-map-info`).removeClass(`d-none`);
    $(`#${tab_name}-point-map-info #${tab_name}-point-map-title`).text(`Thông tin điểm khai thác`);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Tên công trình khai thác</td>`);
    newRow.append(`<td>${properties.ten_cong_trinh_khai_thac !== undefined ? properties.ten_cong_trinh_khai_thac : ''}</td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Tên điểm khai thác</td>`);
    newRow.append(`<td>${properties.ten_diem_khai_thac !== undefined ? properties.ten_diem_khai_thac : ''}</td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Địa chỉ chi tiết</td>`);
    newRow.append(`<td>${properties.dia_chi_chi_tiet !== undefined ? properties.dia_chi_chi_tiet : ''}</td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    var luu_luong = properties.luu_luong_khai_thac === undefined ? 'Không xác định' : properties.luu_luong_khai_thac + ' m³/ngày';
    newRow.append(`<td>Lưu lượng cho phép</td>`);
    newRow.append(`<td>${luu_luong} </td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Mục đích sử dụng</td>`);
    newRow.append(`<td>${properties.muc_dich_su_dung !== undefined ? properties.muc_dich_su_dung : ''}</td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Phương thức khai thác</td>`);
    newRow.append(`<td>${properties.phuong_thuc_khai_thac !== undefined ? properties.phuong_thuc_khai_thac : ''}</td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    var che_do_khai_thac = properties.che_do_khai_thac === undefined ? 'Không xác định' : properties.che_do_khai_thac;
    newRow.append(`<td>Chế độ khai thác</td>`);
    newRow.append(`<td>${che_do_khai_thac} </td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    var nguon_nuoc_khai_thac = properties.nguon_nuoc_khai_thac === undefined ? 'Không xác định' : properties.nguon_nuoc_khai_thac;
    newRow.append(`<td>Nguồn nước khai thác</td>`);
    newRow.append(`<td>${nguon_nuoc_khai_thac} </td>`);
    $(`#${tab_name}-point-map-info tbody`).append(newRow);

    $(`#${tab_name}-point-map-info .analysis-data`).append(`<p>Lưu lượng khai thác trong 24h qua: <b id="total-flow-text"></b></p>`);
    $(`#${tab_name}-point-map-info .analysis-data`).append(`<canvas id="total-flow-chart"></canvas>`);
    
    // $(`#${tab_name}-point-map-info .analysis-data`).append(`<p>Lưu lượng khai thác nước tại điểm này đã tăng 70% trong vòng 24 giờ qua, cho thấy khả năng nhu cầu sử dụng nước bất thường tăng cao hoặc sự gia tăng đáng kể trong hoạt động khai thác.</p>`);
    // draw_water_flow_chart({}, 'total-flow-chart');
    show_wl_data(properties.id, 'total-flow-chart', 7);

}

$("#license-point-map-info__close-btn").on(`click`, function() {
    $("#license-point-map-info").addClass(`d-none`);
});

$("#station-point-map-info__close-btn").on(`click`, function() {
    $("#station-point-map-info").addClass(`d-none`);
});

function show_ms_info(properties) {
    // console.log(properties);
    $(`#license-point-map-info tbody`).empty();
    $(`#license-point-map-info .analysis-data`).empty();
    $(`#license-point-map-info`).removeClass(`d-none`);
    $(`#license-point-map-info #license-point-map-title`).text(`Thông tin điểm quan trắc`);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Mã trạm</td>`);
    newRow.append(`<td>${properties.ma_tram !== undefined ? properties.ma_tram : ''}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Số hiệu</td>`);
    newRow.append(`<td>${properties.so_hieu !== undefined ? properties.so_hieu : ''}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Vị trí</td>`);
    newRow.append(`<td>${properties.vi_tri !== undefined ? properties.vi_tri : ''}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Kinh độ</td>`);
    newRow.append(`<td>${properties.kinh_do !== undefined ? properties.kinh_do : ''}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Vĩ độ</td>`);
    newRow.append(`<td>${properties.vi_do !== undefined ? properties.vi_do : ''}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Loại trạm</td>`);
    newRow.append(`<td>${properties.loai_tram !== undefined ? properties.loai_tram : ''}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Trạng thái</td>`);
    newRow.append(`<td>${properties.cau_hinh_id ? 'Hoạt động' : 'Ngưng hoạt động'}</td>`);
    $(`#license-point-map-info tbody`).append(newRow);

    $("#license-point-map-info .analysis-data").append(`
        <div style="display: flex; justify-content: space-between;">
            <p class="mb-2 mt-2">Chỉ số chất lượng nước hiện tại: <b id="license-wqi-text"></b></p>
            <select id="point-data-time-step" class="form-control" style="height: 32px; width: auto; border-radius: 0;">
                <option value="7" selected>7 ngày</option>
                <option value="30">30 ngày</option>
                <option value="90">3 tháng</option>
                <option value="180">6 tháng</option>
                <option value="365">1 năm</option>
            </select>
        </div>
    `);

    $("#point-data-time-step").on('change', function () {
        let day = $("#point-data-time-step").val();
        get_ms_wqi_data(properties.ma_tram, day);

    });

    $("#license-point-map-info .analysis-data").append('<canvas id="license-wqi-chart"></canvas>');

    // Lấy dữ liệu cảm biến
    get_ms_wqi_data(properties.ma_tram, 7);
}

function get_ms_wqi_data(ms_code, day) {
    $.ajax({
        url: `/apps/wqm/api/monitoring_station/CB_${ms_code}/wqi/${day}/`,
        method: 'GET',
        success: function (res) {
            let wqi = {};
            res['data'].forEach(element => {
                let date = element['thoi_gian'].split('T')[0];
                wqi[date] = element['gia_tri'];
            });

            let lastElement = res['data'][res['data'].length - 1];
            $("#license-wqi-text").text(lastElement['gia_tri']);

            try {
                ms_wqi_chart.destroy();
            } catch (e) { }
        
            ms_wqi_chart = draw_ms_wqi_chart(wqi, 'license-wqi-chart');
        }
    });
}

var ms_wqi_chart;

function draw_ms_wqi_chart(data, element_id) {

    const labels = Object.keys(data);
    const values = Object.values(data);

    var chart_element = document.getElementById(element_id).getContext("2d");

    return new Chart(chart_element, {
        type: 'line',
        data: {
            labels: labels, 
            datasets: [{
                label: 'WQI',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Ngày'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'WQI'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false // Ẩn nhãn trên cùng
                }
            }
        }
    });
}


function show_wl_data(ms_code, element_id, day) {
    console.log('hehe');
    $.ajax({
        url: `/apps/wqm/api/water_station/${ms_code}/wl/${day}/`,
        method: 'GET',
        success: function (res) {
            let wl = {};
            console.log(res);
            res['data'].forEach(element => {
                let date = element['thoi_gian'].split('T')[0];
                wl[date] = element['gia_tri'];
            });

            let lastElement = res['data'][res['data'].length - 1];
            $("#total-flow-text").text(`${lastElement['gia_tri']} m³`);

            try {
                water_flow_chart.destroy();
            } catch (e) { }
        
            water_flow_chart = draw_ms_wqi_chart(wl, element_id);
        }
    });
}

var water_flow_chart;

function draw_water_flow_chart(data, element_id) {
    const labels = Object.keys(data);
    const values = Object.values(data);

    var chartElement = document.getElementById(element_id).getContext("2d");
    try {
        water_flow_chart.destroy();
    } catch (e) { }

    water_flow_chart = new Chart(chartElement, {
        type: 'line',
        data: {
            labels: labels, // Trục x: giờ
            datasets: [{
                label: 'Lưu lượng nước',
                data: values, // Trục y: lưu lượng
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Giờ'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Lưu lượng'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false // Ẩn nhãn trên cùng
                }
            }
        }
    });
}