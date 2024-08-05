
function create_map(map_container) {
    var map = new maplibregl.Map({
        container: map_container,
        style: {
            version: 8,
            sources: {
                "becagisSource": {
                    type: "raster",
                    tiles: ["https://maps.becagis.vn/tiles/basemap/light/{z}/{x}/{y}.png"],
                    tileSize: 256,
                },
                "diem_khai_thac": {
                    type: "vector",
                    tiles: ["https://martin.mkdc.vn/table.public.diem_khai_thac_nuoc.geom/{z}/{x}/{y}"],
                },
                "diem_quan_trac": {
                    type: "vector",
                    tiles: ["https://martin.mkdc.vn/table.public.diem_quan_trac.geom/{z}/{x}/{y}"],
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
                        'raster-opacity': 0.6
                    }
                },
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
    return map;
}

function hide_layer(layer_id) {
    map.setLayoutProperty(layer_id, 'visibility', 'none');
}

function add_ms_layer(map, icon_size) {
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
                type: "symbol",
                source: "diem_quan_trac",
                "source-layer": "table.public.diem_quan_trac.geom",
                layout: {
                    "icon-image": [
                        "case",
                        ["!=", ["get", "cau_hinh_id"], null], // Kiểm tra nếu cau_hinh_id khác null
                        "diem_quan_trac_icon_1",               // Nếu khác null, dùng icon 1
                        "diem_quan_trac_icon_0"                // Nếu null, dùng icon 0
                    ],
                    "icon-size": icon_size,
                },
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

function add_water_point_layer(map, icon_size) {

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
                layout: {
                    "icon-image": "diem_khai_thac_icon",
                    "icon-size": icon_size,
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
}

function describe_water_flow(currentFlow, flow24hAgo) {
    const increasePercentage = ((currentFlow - flow24hAgo) / flow24hAgo) * 100;
    let description;
    
    if (increasePercentage > 30) {
        description = `Lưu lượng khai thác nước tại điểm này đã <b>tăng ${increasePercentage.toFixed(2)}%</b> trong vòng 24 giờ qua, cho thấy khả năng nhu cầu sử dụng nước bất thường tăng cao hoặc sự gia tăng đáng kể trong hoạt động khai thác.`;
    } else if (increasePercentage < -30) {
        description = `Lưu lượng khai thác nước tại điểm này đã <b>giảm ${Math.abs(increasePercentage).toFixed(2)}%</b> trong vòng 24 giờ qua, cho thấy có thể có sự giảm sút trong nhu cầu sử dụng nước hoặc hoạt động khai thác.`;
    } else {
        description = `Lưu lượng khai thác nước tại điểm này không thay đổi nhiều trong vòng 24 giờ qua, cho thấy sự ổn định trong nhu cầu sử dụng nước và hoạt động khai thác.`;
    }

    return description;
}


function decode_HTML_entities(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc.documentElement.textContent.replaceAll("'", '"');
}

function sendEmail(config) {
    // console.log(from_email);
    // console.log(to_email);
    // console.log(password_email);
    // console.log(subject_email);
    // console.log(template_email);
    // console.log(token_email);

    let contentEmail = `
        Kết quả đánh giá rủi ro cấp nước ${resultTitle} (${resultTime}) cho thấy ${riskValues[0]} xã có chỉ số rủi ro cấp nước ở mức Thấp, ${riskValues[1]} xã có chỉ số rủi ro cấp nước Vừa, ${riskValues[2]} xã có chỉ số rủi ro cấp nước Cao và ${riskValues[3]} xã có chỉ số rủi ro cấp nước Rất cao.
    `;

    $.ajax({
        url: `https://api.mkdc.com.vn/emonre/1.0.0?fromMail=${from_email}&fromPassword=${password_email}&tomail=${to_email}&fromSubject=${subject_email}`,
        type: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token_email}` 
        },
        contentType: 'application/json',
        data: JSON.stringify({
            "content": `${contentEmail}`,
        }),
        success: function(data) {
            // console.log('Email sent successfully:', data);
            $("#success-send-email").modal('show');
        },
        error: function(xhr, status, error) {
            // console.error('Error sending email:', error);
            $("#failure-send-email").modal('show');

        }
    });
}
