let filter = ['step', ["to-number", ["get", "WQI"]], '#802323', 0, '#802323', 10, '#fe0000', 26, '#f4b083', 51, '#ffff00', 76, '#00af50', 91, '#01b0f1'];

// Fake data
// Fake data
let geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.468424, 10.257405]
            },
            "properties": {
                "WQI": 21
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.432899, 10.241806]
            },
            "properties": {
                "WQI": 77
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.421154, 10.165152]
            },
            "properties": {
                "WQI": 71
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.396753, 10.292412]
            },
            "properties": {
                "WQI": 45
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.359872, 10.235721]
            },
            "properties": {
                "WQI": 90
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.389589, 10.315689]
            },
            "properties": {
                "WQI": 68
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.314532, 10.271469]
            },
            "properties": {
                "WQI": 69
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.283614, 10.198964]
            },
            "properties": {
                "WQI": 74
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.362125, 10.204697]
            },
            "properties": {
                "WQI": 80
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.439898, 10.293450]
            },
            "properties": {
                "WQI": 72
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.502749, 10.274215]
            },
            "properties": {
                "WQI": 78
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.476284, 10.213521]
            },
            "properties": {
                "WQI": 70
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.355214, 10.306452]
            },
            "properties": {
                "WQI": 91
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.310032, 10.249632]
            },
            "properties": {
                "WQI": 15
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.382469, 10.182414]
            },
            "properties": {
                "WQI": 55
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.427632, 10.273632]
            },
            "properties": {
                "WQI": 27
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.466214, 10.215632]
            },
            "properties": {
                "WQI": 65
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.396315, 10.278652]
            },
            "properties": {
                "WQI": 43
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.332145, 10.242512]
            },
            "properties": {
                "WQI": 61
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [105.379845, 10.289632]
            },
            "properties": {
                "WQI": 18
            }
        }
    ]
};



// Hiện bản đồ
var map = new maplibregl.Map({
    container: 'wqi-map',
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
                    'raster-opacity': 0.5
                }
            },
            {
                id: "result_layer",
                type: "circle",
                source: "myGeoJSONSource",
                paint: {
                    "circle-radius": 8,
                    "circle-color": filter,
                },
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

        // Thay đổi con trỏ chuột khi di chuyển qua điểm
        map.on("mouseenter", "diem_khai_thac_nuoc_layer", function () {
            map.getCanvas().style.cursor = "pointer";
        });

        // Thay đổi con trỏ chuột về lại ban đầu khi rời khỏi điểm
        map.on("mouseleave", "diem_khai_thac_nuoc_layer", function () {
            map.getCanvas().style.cursor = "";
        });

    });
});

// Thay đổi con trỏ chuột khi di chuyển qua điểm
map.on("mouseenter", "result_layer", function () {
    map.getCanvas().style.cursor = "pointer";
});

// Thay đổi con trỏ chuột về lại ban đầu khi rời khỏi điểm
map.on("mouseleave", "result_layer", function () {
    map.getCanvas().style.cursor = "";
});

map.on("click", function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["result_layer"] });
    if (!features.length) {
        return;
    }

    var properties = features[0].properties;

    show_point_data(properties);
    draw_wqi_chart();
});

function show_point_data(data) {
    $("#point-data").removeClass('d-none');
}

$("#point-data__close-btn").on('click', function () {
    $("#point-data").addClass('d-none');
});


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

