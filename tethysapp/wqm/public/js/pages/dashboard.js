let map = create_map('map');
let active_water_points = [];
add_ms_layer_to_map();
add_water_point_layer_to_map();
add_dashboard_map_click_event(map);
$("#last-updated-time").text(`07:00 ${new Date().toLocaleDateString('vi')}`);

let wqi_lookup;

let ms_active = [];
let layerLoaded = false;
let filter = [
    'match',
    ['get', 'id'],
]

$.ajax({
    url: '/apps/wqm/api/wqi_lookup/',
    method: 'GET',
    success: function (res) {
        wqi_lookup = res['data'];

        wqi_lookup.forEach(e => {
            $("#dashboard-map-legend").append(
                `
                <div class="legend-item">
                    <div class="tag-circle" style="background-color:${e['mau_sac']};"></div>
                    <span class="legend-text">${e['mo_ta']} (${e['gia_tri_thap_nhat']} - ${e['gia_tri_cao_nhat']})</span>
                </div>
                `
            );
        });

        // Sử dụng sự kiện 'idle' để bắt sự kiện khi tất cả tài nguyên đã được load
        map.on('idle', () => {
            // Kiểm tra nếu layer đã được load
            if (!layerLoaded && map.getLayer('diem_quan_trac_layer')) {
                layerLoaded = true;

                $.ajax({
                    url: `/apps/wqm/api/monitoring_stations/active/`,
                    method: 'GET',
                    success: function (res) {
                        ms_active = res['data'];

                        const features = map.queryRenderedFeatures({ layers: ['diem_quan_trac_layer'] });
                        features.forEach(feature => {

                            const result = ms_active.find(item => item.id === feature.properties.id);
                            let last_value = result['du_lieu_quan_trac'][result['du_lieu_quan_trac'].length - 1];

                            filter.push(feature.properties.id);
                            filter.push(get_color_from_WQI(last_value[1]));

                        });

                        filter.push('#ccc');
                        map.setPaintProperty('diem_quan_trac_layer', 'circle-color', filter);

                        $("#dashboard-map-legend").append(
                            `
                            <div class="time-demension">
                                <button id="play-button" class="btn play-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                        class="bi bi-play-fill" viewBox="0 0 16 16">
                                        <path
                                            d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                                    </svg>
                                </button>
                                <div id="slider-container" class="slider-container">
                                    <div id="slider" class="slider"></div>
                                    <div id="slider-tooltip" class="slider-tooltip">
                                        <span id="slider-tooltip-text"></span>
                                    </div>
                                </div>
                            </div>
                            `
                        );
                        init_slider();
                    }
                });
            }
        });
    },
});

function get_color_from_WQI(wqi) {
    let result = '#ccc';
    if (wqi_lookup) {
        wqi_lookup.forEach(e => {
            if (e['gia_tri_thap_nhat'] <= wqi && wqi <= e['gia_tri_cao_nhat']) {
                result = e['mau_sac'];
            }   
        });
    }

    return result;
}

function updateColor(id, wqi) {
    // Tìm vị trí của id trong mảng filter
    for (let i = 1; i < filter.length; i += 1) {
        if (filter[i] === id) {
            filter[i + 1] = get_color_from_WQI(wqi);
            return; 
        }
    }
}

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
                    "circle-opacity": 0.9,
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

function formatData(data) {
    // Tạo một object rỗng để lưu trữ dữ liệu
    let formattedObject = {};

    // Duyệt qua từng phần tử trong dữ liệu
    data.forEach(item => {
        // Chuyển đổi ngày thành định dạng yyyy-mm-dd
        let date = new Date(item[0]);
        let formattedDate = date.toISOString().split('T')[0];

        // Thêm dữ liệu vào object với ngày làm key
        formattedObject[formattedDate] = item[1];
    });

    // Trả về object đã được định dạng
    return formattedObject;
}

function formatDateString(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    let day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function init_slider() {
    $(document).ready(function () {
        let data_for_slider = {};
        let ms_active_id = [];

        ms_active.forEach(element => {
            // let data_for_slider = {};
            // ms_active_id.push(element['id']);
            data_for_slider[element['id']] = formatData(element['du_lieu_quan_trac']);
        });

        var current = 0;
        var isPlaying = false;
        var step = 1;
        var intervalId;
        var dayMilliseconds = 24 * 60 * 60 * 1000; // Số mili giây trong một ngày

        // Khởi tạo ngày bắt đầu và ngày kết thúc (30 ngày trước ngày hôm nay)
        var today = new Date();
        var dataTime = [];
        for (var i = 30; i >= 0; i--) {
            dataTime.push(new Date(today.getTime() - (i * dayMilliseconds)));
        }

        $("#slider-tooltip-text").text(formatDateString(dataTime[0]));

        function updateSliderColor(value, max) {
            var percentage = (value / max) * 100;
            $(".ui-slider-range").css("width", percentage + "%");
        }

        function handlerTimeSlider(date_string) {
            for (let key in data_for_slider) {
                updateColor(key, data_for_slider[key][date_string]);
            }
        
            map.setPaintProperty('diem_quan_trac_layer', 'circle-color', filter);
        }

        $("#slider").slider({
            range: "min",
            min: 0,
            max: dataTime.length - 1,
            step: step,
            value: 0,
            slide: function (event, ui) {
                current = ui.value;
                let dateString = formatDateString(dataTime[current]);
                $("#slider-tooltip-text").text(dateString);
                updateSliderColor(current, dataTime.length - 1);
                handlerTimeSlider(dateString);
                // handlerTimeSlider(dataTime[current], supportMap); // Hàm này có thể thêm nếu cần thiết
            },
        });

        // Xử lý sự kiện khi nhấn nút play
        $("#play-button").click(function () {
            if (!isPlaying) {
                isPlaying = true;
                $("#play-button").html('<svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></svg>');
                var end = dataTime.length - 1;

                if (current === end) {
                    current = 0;
                }

                function run() {
                    current += step;
                    $("#slider").slider("value", current); // Cập nhật giá trị của slider
                    let dateString = formatDateString(dataTime[current]);
                    $("#slider-tooltip-text").text(dateString);
                    updateSliderColor(current, dataTime.length - 1);
                    handlerTimeSlider(dateString);

                    if (current < end && isPlaying) {
                        intervalId = setTimeout(run, 300);
                    } else {
                        isPlaying = false;
                        $("#play-button").html('<svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>');
                    }
                }

                run(); // Bắt đầu chạy
            } else {
                isPlaying = false;
                clearTimeout(intervalId);
                $("#play-button").html('<svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>');
            }
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
