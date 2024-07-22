var water_exploitation_points;

$("#point-data__close-btn").on('click', function () {
    $("#point-data").addClass('d-none');
});

$("#ms-point-data__close-btn").on('click', function () {
    $("#ms-point-data").addClass('d-none');
});

function on_view_license_button_click(license_id) {
    console.log(license_id);
    $('#content-box__license').addClass('d-none');
    $('#content-box__license-detail').removeClass('d-none');

    // Thêm và áp dụng filter để lọc điểm khai thác của license_id
    map.setFilter('diem_khai_thac_nuoc_layer', ['==', ['get', 'giay_phep_tai_nguyen_nuoc_id'], license_id]);
    $('#point-data').addClass('d-none');

    // Lấy thông tin giấy phép
    const license_data = licenses_cache.find(obj => obj.id === license_id);

    // Điền vào bảng
    $("#license-so-hieu").text(license_data["so_hieu_van_ban"]);
    $("#license-ngay-ban-hanh").text(license_data["ngay_ban_hanh"]);
    $("#license-ngay-het-han").text(license_data["ngay_het_han"]);
    $("#license-loai-giay-phep").text(license_data["loai_giay_phep"]);
    $("#license-ten-to-chuc").text(license_data["ten_to_chuc_ca_nhan"]);
    $("#license-diem-khai-thac").text('');

    $.ajax({
        'url': `/apps/wqm/api/licenses/${license_id}/water_exploitation_points`,
        'method': 'GET',
        'success': function (res) {
            water_exploitation_points = res['data'];
            $("#license-diem-khai-thac").text(water_exploitation_points.length);
        }
    });
}

function on_close_license_detail_click() {
    $('#content-box__license').removeClass('d-none');
    $('#content-box__license-detail').addClass('d-none');
}

// Fake data
let geojson = 
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [105.468424, 10.257405]
      },
      "properties": {
        "WQI": 76,
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [105.432899, 10.241806]
      },
      "properties": {
        "WQI": 77,
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [105.421154, 10.165152]
      },
      "properties": {
        "WQI": 71,
      }
    }
  ]
};

// Hiện bản đồ
var map = new maplibregl.Map({
    container: 'license-map',
    style: {
        version: 8,
        sources: {
            "becagisSource": {
                type: "raster",
                tiles: ["https://maps.becagis.vn/tiles/basemap/light/{z}/{x}/{y}.png"],
                tileSize: 256,
            },
            'myGeoJSONSource': {
                type: 'geojson',
                data: geojson,
            },
            "diem_khai_thac_nuoc": {
                type: "vector",
                tiles: ["https://martin.mkdc.vn/table.public.diem_khai_thac_nuoc.geom/{z}/{x}/{y}"],
            },
        },
        layers: [
            {
                id: "becagisLayer",
                type: "raster",
                source: "becagisSource",
                minzoom: 0,
                maxzoom: 22,
                paint: {
                    'raster-opacity': 0.7
                }
            }
        ],
    },
    center: [104.9, 10.2],
    maxBounds: [
        [100.5, 8.0],
        [110.5, 11.5],
    ],
    zoom: 6,
});

map.addControl(new maplibregl.NavigationControl());

map.on("load", async function () {
    const imagePromises = [
        map.loadImage("/static/wqm/images/diem_quan_trac.png"),
        map.loadImage("/static/wqm/images/diem_khai_thac_nuoc.png"),
    ];

    Promise.all(imagePromises).then(images => {
        map.addImage("diem_quan_trac", images[0].data);
        map.addImage("diem_khai_thac_nuoc", images[1].data);

        // Thêm layer polygon sau khi đã tải xong ảnh
        map.addLayer(
            {
                id: "diem_khai_thac_nuoc_layer",
                type: "symbol",
                source: "diem_khai_thac_nuoc",
                "source-layer": "table.public.diem_khai_thac_nuoc.geom",
                layout: {
                    "icon-image": "diem_khai_thac_nuoc",
                    "icon-size": 1,
                },
            }
        );

        map.addLayer({
            id: 'myGeoJSONLayer',
            type: "symbol",
            source: "myGeoJSONSource",
            layout: {
                "icon-image": "diem_quan_trac",
                "icon-size": 0.4,
            },
        });

        // Thay đổi con trỏ chuột khi di chuyển qua điểm
        map.on("mouseenter", "diem_khai_thac_nuoc_layer", function () {
            map.getCanvas().style.cursor = "pointer";
        });

        // Thay đổi con trỏ chuột về lại ban đầu khi rời khỏi điểm
        map.on("mouseleave", "diem_khai_thac_nuoc_layer", function () {
            map.getCanvas().style.cursor = "";
        });

                // Thay đổi con trỏ chuột khi di chuyển qua điểm
                map.on("mouseenter", "myGeoJSONLayer", function () {
                    map.getCanvas().style.cursor = "pointer";
                });
        
                // Thay đổi con trỏ chuột về lại ban đầu khi rời khỏi điểm
                map.on("mouseleave", "myGeoJSONLayer", function () {
                    map.getCanvas().style.cursor = "";
                });
    });
});

map.on("click", function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["diem_khai_thac_nuoc_layer"] });
    if (!features.length) {
        return;
    }

    var properties = features[0].properties;
    console.log(properties);
    show_point_data(properties);
});


map.on("click", function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["myGeoJSONLayer"] });
    if (!features.length) {
        return;
    }

    var properties = features[0].properties;
    show_ms_point_data(properties);
});

function show_ms_point_data(properties) {
    // $('#ms-point-data tbody').empty();
    $('#ms-point-data').removeClass('d-none');
    draw_ms_wqi_chart();
}


function show_point_data(properties) {
    $('#point-data tbody').empty();
    $('#point-data').removeClass('d-none');

    // Tạo thẻ tr mới
    var newRow = $('<tr>');
    newRow.append('<td>Tên công trình khai thác</td>');
    newRow.append(`<td>${properties.ten_cong_trinh_khai_thac}</td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Tên điểm khai thác</td>');
    newRow.append(`<td>${properties.ten_diem_khai_thac}</td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Địa chỉ chi tiết</td>');
    newRow.append(`<td>${properties.dia_chi_chi_tiet}</td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    var luu_luong = properties.luu_luong_khai_thac === undefined ? 'Không xác định' : properties.luu_luong_khai_thac + ' m³/ngày';
    newRow.append('<td>Lưu lượng cho phép</td>');
    newRow.append(`<td>${luu_luong} </td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Mục đích sử dụng</td>');
    newRow.append(`<td>${properties.muc_dich_su_dung}</td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Phương thức khai thác</td>');
    newRow.append(`<td>${properties.phuong_thuc_khai_thac}</td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    var che_do_khai_thac = properties.che_do_khai_thac === undefined ? 'Không xác định' : properties.che_do_khai_thac;
    newRow.append('<td>Chế độ khai thác</td>');
    newRow.append(`<td>${che_do_khai_thac} </td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    var nguon_nuoc_khai_thac = properties.nguon_nuoc_khai_thac === undefined ? 'Không xác định' : properties.nguon_nuoc_khai_thac;
    newRow.append('<td>Nguồn nước khai thác</td>');
    newRow.append(`<td>${nguon_nuoc_khai_thac} </td>`);
    $('#point-data tbody').append(newRow);

    $("#total-flow-text").text('150.5 m³');
    $("#total-flow-analysis").text('Lưu lượng khai thác nước tại điểm này đã tăng 70% trong vòng 24 giờ qua, cho thấy khả năng nhu cầu sử dụng nước bất thường tăng cao hoặc sự gia tăng đáng kể trong hoạt động khai thác.');

    draw_water_flow_chart();
}

var water_flow_chart;

function draw_water_flow_chart() {
    const data = {
        1: 6.82,
        2: 5.83,
        3: 5.73,
        4: 8.24,
        5: 7.62,
        6: 1.25,
        7: 6.01,
        8: 7.28,
        9: 5.92,
        10: 6.76,
        11: 10.47,
        12: 6.41,
        13: 2.87,
        14: 5.01,
        15: 5.22,
        16: 5.34,
        17: 5.17,
        18: 8.92,
        19: 11.53,
        20: 5.78,
        21: 6.16,
        22: 5.85,
        23: 6.79,
        24: 5.93
    };
    const labels = Object.keys(data);
    const values = Object.values(data);

    var chartElement = document.getElementById("total-flow-chart").getContext("2d");
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

var wqi_chart;

function draw_wqi_chart() {
    const data = {
        '2024-06-01': 43,
        '2024-06-02': 85,
        '2024-06-03': 76,
        '2024-06-04': 9,
        '2024-06-05': 42,
        '2024-06-06': 56,
        '2024-06-07': 14,
        '2024-06-08': 98,
        '2024-06-09': 61,
        '2024-06-10': 79,
        '2024-06-11': 34,
        '2024-06-12': 5,
        '2024-06-13': 71,
        '2024-06-14': 88,
        '2024-06-15': 33,
        '2024-06-16': 62,
        '2024-06-17': 97,
        '2024-06-18': 46,
        '2024-06-19': 81,
        '2024-06-20': 2,
        '2024-06-21': 23,
        '2024-06-22': 67,
        '2024-06-23': 54,
        '2024-06-24': 75,
        '2024-06-25': 38,
        '2024-06-26': 92,
        '2024-06-27': 10,
        '2024-06-28': 29,
        '2024-06-29': 84,
        '2024-06-30': 19,
        '2024-07-01': 45
    };
    
    const labels = Object.keys(data);
    const values = Object.values(data);

    var chartElement = document.getElementById("wqi-chart").getContext("2d");
    try {
        wqi_chart.destroy();
    } catch (e) { }

    wqi_chart = new Chart(chartElement, {
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



var ms_wqi_chart;

function draw_ms_wqi_chart() {
    const data = {
        '2024-06-01': 43,
        '2024-06-02': 85,
        '2024-06-03': 76,
        '2024-06-04': 9,
        '2024-06-05': 42,
        '2024-06-06': 56,
        '2024-06-07': 14,
        '2024-06-08': 98,
        '2024-06-09': 61,
        '2024-06-10': 79,
        '2024-06-11': 34,
        '2024-06-12': 5,
        '2024-06-13': 71,
        '2024-06-14': 88,
        '2024-06-15': 33,
        '2024-06-16': 62,
        '2024-06-17': 97,
        '2024-06-18': 46,
        '2024-06-19': 81,
        '2024-06-20': 2,
        '2024-06-21': 23,
        '2024-06-22': 67,
        '2024-06-23': 54,
        '2024-06-24': 75,
        '2024-06-25': 38,
        '2024-06-26': 92,
        '2024-06-27': 10,
        '2024-06-28': 29,
        '2024-06-29': 84,
        '2024-06-30': 19,
        '2024-07-01': 45
    };
    
    const labels = Object.keys(data);
    const values = Object.values(data);

    var chartElement = document.getElementById("license-wqi-chart").getContext("2d");
    try {
        ms_wqi_chart.destroy();
    } catch (e) { }

    ms_wqi_chart = new Chart(chartElement, {
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

