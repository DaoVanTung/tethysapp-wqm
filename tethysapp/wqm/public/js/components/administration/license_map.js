$("#point-data__close-btn").on('click', function () {
    $("#point-data").addClass('d-none');
});

function on_view_license_button_click(license_id) {
    $('#content-box__license-detail').removeClass('d-none');
    $('#content-box__license').addClass('d-none');

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

    map.once('idle', function () {
        var features = map.queryRenderedFeatures({ layers: ["diem_khai_thac_nuoc_layer"] });
        $("#license-diem-khai-thac").text(features.length);
    
    });
}

function on_close_license_detail_click() {
    $('#content-box__license').removeClass('d-none');
    $('#content-box__license-detail').addClass('d-none');
}

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
        map.addImage("diem_xa_thai", images[0].data);
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
                    "icon-size": 0.4,
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

map.on("click", function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["diem_khai_thac_nuoc_layer"] });
    if (!features.length) {
        return;
    }

    var properties = features[0].properties;
    console.log(properties);
    show_point_data(properties);
});

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
    newRow.append('<td>Lưu lượng cho phép</td>');
    newRow.append(`<td>${properties.luu_luong_khai_thac} m³/ngày</td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Mục đích sử dụng</td>');
    newRow.append(`<td>${properties.muc_dich_su_dung}</td>`);
    $('#point-data tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Phương thức khai thác</td>');
    newRow.append(`<td>${properties.phuong_thuc_khai_thac}</td>`);
    $('#point-data tbody').append(newRow);

}