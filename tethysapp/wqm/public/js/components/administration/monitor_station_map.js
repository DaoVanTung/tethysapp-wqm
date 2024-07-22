$("#ms-data__close-btn").on('click', function () {
    $("#ms-data").addClass('d-none');
});



// Hiện bản đồ
var ms_map = new maplibregl.Map({
    container: 'ms-map',
    style: {
        version: 8,
        sources: {
            "becagisSource": {
                type: "raster",
                tiles: ["https://maps.becagis.vn/tiles/basemap/light/{z}/{x}/{y}.png"],
                tileSize: 256,
            },
            "diem_quan_trac": {
                type: "vector",
                tiles: ["https://martin.mkdc.vn/table.public.diem_quan_trac.geom/{z}/{x}/{y}"],
            },
            "diem_khai_thac": {
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

ms_map.addControl(new maplibregl.NavigationControl());


ms_map.on("load", async function () {
    const imagePromises = [
        ms_map.loadImage("/static/wqm/images/diem_quan_trac.png"),
        ms_map.loadImage("/static/wqm/images/diem_khai_thac_nuoc.png"),

    ];

    Promise.all(imagePromises).then(images => {
        ms_map.addImage("diem_quan_trac_icon", images[0].data);
        ms_map.addImage("diem_khai_thac_icon", images[1].data);



        ms_map.addLayer(
            {
                id: "diem_khai_thac_layer",
                type: "symbol",
                source: "diem_khai_thac",
                "source-layer": "table.public.diem_khai_thac_nuoc.geom",
                layout: {
                    "icon-image": "diem_khai_thac_icon",
                    "icon-size": 0.4,
                },


                filter: [">=", ["to-number", ["get", "luu_luong_khai_thac"]], 3000]
            }
        );

        // Thêm layer polygon sau khi đã tải xong ảnh
        ms_map.addLayer(
            {
                id: "diem_quan_trac_layer",
                type: "symbol",
                source: "diem_quan_trac",
                "source-layer": "table.public.diem_quan_trac.geom",
                layout: {
                    "icon-image": "diem_quan_trac_icon",
                    "icon-size": 0.4,
                },
            }
        );

        // Thay đổi con trỏ chuột khi di chuyển qua điểm
        ms_map.on("mouseenter", "diem_quan_trac_layer", function () {
            ms_map.getCanvas().style.cursor = "pointer";
        });

        // Thay đổi con trỏ chuột về lại ban đầu khi rời khỏi điểm
        ms_map.on("mouseleave", "diem_quan_trac_layer", function () {
            ms_map.getCanvas().style.cursor = "";
        });
    });
});

ms_map.on("click", function (e) {
    var features = ms_map.queryRenderedFeatures(e.point, { layers: ["diem_quan_trac_layer"] });
    if (!features.length) {
        return;
    }

    var properties = features[0].properties;
    console.log(properties);
    show_ms_data(properties);
});


function show_ms_data(properties) {
    $('#ms-data tbody').empty();
    $('#ms-data').removeClass('d-none');

    // Tạo thẻ tr mới
    var newRow = $('<tr>');
    newRow.append('<td>Mã trạm</td>');
    newRow.append(`<td>${properties.ma_tram}</td>`);
    $('#ms-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Số hiệu</td>');
    newRow.append(`<td>${properties.so_hieu}</td>`);
    $('#ms-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Vị trí</td>');
    newRow.append(`<td>${properties.vi_tri}</td>`);
    $('#ms-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Kinh độ</td>');
    newRow.append(`<td>${properties.kinh_do} </td>`);
    $('#ms-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Vĩ độ</td>');
    newRow.append(`<td>${properties.vi_do} </td>`);
    $('#ms-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Loại trạm</td>');
    newRow.append(`<td>${properties.loai_tram}</td>`);
    $('#ms-data tbody').append(newRow);

    var newRow = $('<tr>');
    var trang_thai = properties.trang_thai === 1 ? 'Đang hoạt động' : 'Không hoạt động';
    newRow.append('<td>Trạng thái</td>');
    newRow.append(`<td>${trang_thai} </td>`);
    $('#ms-data tbody').append(newRow);

    draw_wqi_chart();
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

