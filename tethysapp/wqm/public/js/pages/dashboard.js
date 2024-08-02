let map = create_map('map');
let active_water_points = [];
add_ms_layer_to_map();
add_water_point_layer_to_map();
add_dashboard_map_click_event(map);
$("#last-updated-time").text(`07:00 ${new Date().toLocaleDateString('vi')}`);

function add_water_point_layer_to_map() {
    $.ajax({
        url: '/apps/wqm/api/water_exploitation_points/active',
        type: 'GET',
        success: function (res) {
            active_water_points = res['data'];

            let wep_list = [];
            res['data'].forEach(element => {
                wep_list.push(element['id']);
            });

            const imagePromises = [
                map.loadImage("/static/wqm/images/diem_khai_thac.png"),
            ];

            Promise.all(imagePromises).then(images => {
                map.addImage("diem_khai_thac_icon", images[0].data);

                map.addLayer(
                    {
                        id: "diem_khai_thac_layer",
                        type: "symbol",
                        source: "diem_khai_thac",
                        "source-layer": "table.public.diem_khai_thac_nuoc.geom",
                        filter: ["in", ["get", "id"], ["literal", wep_list]],
                        layout: {
                            "icon-image": "diem_khai_thac_icon",
                            "icon-size": 0.3,
                        },
                    }
                );

                map.on("mouseenter", "diem_khai_thac_layer", function () {
                    map.getCanvas().style.cursor = "pointer";
                });

                map.on("mouseleave", "diem_khai_thac_layer", function () {
                    map.getCanvas().style.cursor = "";
                });
            });
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });
}


// Lấy điểm quan trắc đang hoạt động
function add_ms_layer_to_map() {
    const imagePromises = [
        map.loadImage("/static/wqm/images/diem_quan_trac_0.png"),
        map.loadImage("/static/wqm/images/diem_quan_trac_1.png"),
    ];

    Promise.all(imagePromises).then(images => {
        map.addImage("diem_quan_trac_icon_0", images[0].data);
        map.addImage("diem_quan_trac_icon_1", images[1].data);

        map.addLayer(
            {
                id: "diem_quan_trac_layer",
                type: "circle",
                source: "diem_quan_trac",
                "source-layer": "table.public.diem_quan_trac.geom",
                paint: {
                    "circle-radius": 8,
                    "circle-color": "#00af50",
                    "circle-opacity": 0.7,
                },
                filter: ["!=", ["get", "cau_hinh_id"], null],
                minzoom: 0,
                maxzoom: 24
            }
        );

        map.on("mouseenter", "diem_quan_trac_layer", function () {
            map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "diem_quan_trac_layer", function () {
            map.getCanvas().style.cursor = "";
        });
    });
}


function add_dashboard_map_click_event(dashboard_map) {
    dashboard_map.on("click", function (e) {
        var features = dashboard_map.queryRenderedFeatures(e.point, { layers: ["diem_khai_thac_layer"] });
        if (!features.length) {
            return;
        }

        var properties = features[0].properties;
        show_water_point_info('dashboard', properties);
    });

    dashboard_map.on("click", function (e) {
        var features = dashboard_map.queryRenderedFeatures(e.point, { layers: ["diem_quan_trac_layer"] });
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

    $(`#${tab_name}-point-map-info .analysis-data`).append(`
        <div style="display: flex; justify-content: space-between;">
            <p>Lưu lượng khai thác trong 24h qua: <b id="${tab_name}-total-flow-text"></b></p>
            <select id="point-data-time-step" class="form-control" style="height: 32px; width: auto; border-radius: 0;">
                <option value="7" selected>7 ngày</option>
                <option value="30">30 ngày</option>
                <option value="90">3 tháng</option>
                <option value="180">6 tháng</option>
                <option value="365">1 năm</option>
            </select>
        </div>
    `);

    $(`#${tab_name}-point-map-info .analysis-data`).append(`<canvas id="${tab_name}-total-flow-chart"></canvas>`);


    $("#point-data-time-step").on('change', function () {
        let day = $("#point-data-time-step").val();
        show_wl_data(properties.id, tab_name, 'total-flow-chart', day);
    });

    $(`#${tab_name}-point-map-info .analysis-data`).append(`<p id="${tab_name}-total-flow-desc"></p>`);
    show_wl_data(properties.id, tab_name, `${tab_name}-total-flow-chart`, 7);
}

$("#dashboard-point-map-info__close-btn").on(`click`, function () {
    $("#dashboard-point-map-info").addClass(`d-none`);
});

$("#station-point-map-info__close-btn").on(`click`, function () {
    $("#station-point-map-info").addClass(`d-none`);
});

function show_ms_info(properties) {
    $(`#dashboard-point-map-info tbody`).empty();
    $(`#dashboard-point-map-info .analysis-data`).empty();
    $(`#dashboard-point-map-info`).removeClass(`d-none`);
    $(`#dashboard-point-map-info #dashboard-point-map-title`).text(`Thông tin điểm quan trắc`);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Mã trạm</td>`);
    newRow.append(`<td>${properties.ma_tram !== undefined ? properties.ma_tram : ''}</td>`);
    $(`#dashboard-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Số hiệu</td>`);
    newRow.append(`<td>${properties.so_hieu !== undefined ? properties.so_hieu : ''}</td>`);
    $(`#dashboard-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Vị trí</td>`);
    newRow.append(`<td>${properties.vi_tri !== undefined ? properties.vi_tri : ''}</td>`);
    $(`#dashboard-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Kinh độ</td>`);
    newRow.append(`<td>${properties.kinh_do !== undefined ? properties.kinh_do : ''}</td>`);
    $(`#dashboard-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Vĩ độ</td>`);
    newRow.append(`<td>${properties.vi_do !== undefined ? properties.vi_do : ''}</td>`);
    $(`#dashboard-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Loại trạm</td>`);
    newRow.append(`<td>${properties.loai_tram !== undefined ? properties.loai_tram : ''}</td>`);
    $(`#dashboard-point-map-info tbody`).append(newRow);

    var newRow = $(`<tr>`);
    newRow.append(`<td>Trạng thái</td>`);
    newRow.append(`<td>${properties.cau_hinh_id ? 'Hoạt động' : 'Ngưng hoạt động'}</td>`);
    $(`#dashboard-point-map-info tbody`).append(newRow);

    $("#dashboard-point-map-info .analysis-data").append(`
        <div style="display: flex; justify-content: space-between;">
            <p class="mb-2 mt-2">Chỉ số chất lượng nước hiện tại: <b id="dashboard-wqi-text"></b></p>
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

    $("#dashboard-point-map-info .analysis-data").append('<canvas id="dashboard-wqi-chart"></canvas>');


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
            $("#dashboard-wqi-text").text(lastElement['gia_tri']);

            try {
                ms_wqi_chart.destroy();
            } catch (e) { }

            ms_wqi_chart = draw_ms_wqi_chart(wqi, 'dashboard-wqi-chart');
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

var water_flow_chart;

function show_wl_data(ms_code, tab_name, element_id, day) { 
    $.ajax({
        url: `/apps/wqm/api/water_station/${ms_code}/wl/${day}/`,
        method: 'GET',
        success: function (res) {
            let wl = {};
            res['data'].forEach(element => {
                let date = element['thoi_gian'].split('T')[0];
                wl[date] = element['gia_tri'];
            });

            let lastElement = res['data'][res['data'].length - 1];
            let lastElement_2 = res['data'][res['data'].length - 2];

            $(`#${tab_name}-total-flow-text`).text(`${lastElement['gia_tri']} m³`);
            $(`#${tab_name}-total-flow-desc`).html(describe_water_flow(parseFloat(lastElement['gia_tri']), parseFloat(lastElement_2['gia_tri'])));

            try {
                water_flow_chart.destroy();
            } catch (e) { }

            water_flow_chart = draw_ms_wqi_chart(wl, element_id);
        }
    });
}