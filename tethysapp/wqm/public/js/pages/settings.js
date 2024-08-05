// Lấy danh sách giấy phép
var license_cache = [];
var license_table = null;

//  Tổng giấy phép
var license_total = 0;

// Giấy phép còn hạn
var license_valid = 0;

// Giấy phép sắp hết hạn
var license_expiring_soon = 0;

// Giấy phép đã hết hạn
var license_expired = 0;

// Lấy danh sách điểm quan trắc
var station_cache = [];
var station_table = null;

var license_map = null;
var station_map = null;

var is_init_license_tab = true;
var is_init_station_tab = false;
var is_init_config_tab = false;

$('.menu-box__item').on('click', function() {
    show_content($(this).attr('id'));
});

function get_license_data() {
    $.ajax({
        'url': '/apps/wqm/api/licenses/',
        'method': 'GET',
        'success': function(res) {
            license_cache = res['data'];
            license_total = license_cache.length;

            $("#license-loading-box").addClass("d-none");
            $("#content-box__license").removeClass("d-none");

            fill_licenses_to_table();
            analysis_licenses();
        }
    });
}

function get_ms_data() {
    $.ajax({
        'url': '/apps/wqm/api/monitoring_stations/',
        'method': 'GET',
        'success': function(res) {
            station_cache = res['data'];
            fill_station_to_table();

            $("#station-loading-box").addClass('d-none');
        }
    });
}

function show_content(content_id) {
    let menu_item_selected = $('.menu-box__item.active').attr('id');

    if (content_id === menu_item_selected) {
        return;
    }

    if (content_id === 'menu-station' && is_init_station_tab === false) {
        init_station_tab();
        is_init_station_tab = true;
    }

    if (content_id === 'menu-config' && is_init_config_tab === false) {
        init_config_tab();
        is_init_config_tab = true;
    }

    $('.menu-box__item.active').removeClass('active');
    $('.menu-box__item.active').removeClass('active');
    $(`#content-${menu_item_selected}`).addClass('d-none');
    $(`#content-${content_id}`).removeClass('d-none');
    $(`#${content_id}`).addClass('active');
}


function init_license_tab() {
    license_map = create_map('license-map');
    get_license_data();
    add_ms_layer(license_map, 0.5);
    add_water_point_layer(license_map, 0.3);
    add_license_map_click_event(license_map);
}

// Giá trị lat long tạm thời khi thêm mới điểm khai thác
let temp_lat;
let temp_long;

function init_station_tab() {
    $("#station-loading-box").removeClass('d-none');
    get_ms_data();
    station_map = create_map('station-map');
    add_water_point_layer(station_map, 0.3);
    add_ms_layer(station_map, 0.5);
    add_station_map_click_event(station_map);

    MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
    MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
    MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

    const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            point: true,
            trash: true
        }
    });

    station_map.addControl(draw);

    // Lắng nghe sự kiện tạo điểm
    station_map.on('draw.create', function(e) {
        const point = e.features[0];
        const coordinates = point.geometry.coordinates;

        let popup_content =
            `
            <div style="padding: 4px">
            <p><b>Kinh độ</b>: ${coordinates[0].toFixed(6)}</p>
            <p><b>Vĩ độ</b>: ${coordinates[1].toFixed(6)}</p>
            <button class="btn btn-success" style="height: 32px; width: 100%; border-radius: 0px; margin-top: 8px" onclick="add_ms_from_map()">
                    Thêm mới điểm khai thác
                </button>
            </div>
        `;

        temp_lat = coordinates[1].toFixed(6);
        temp_long = coordinates[0].toFixed(6);

        const popup = new maplibregl.Popup({
                closeOnClick: false
            })
            .setLngLat(coordinates)
            .setHTML(popup_content)
            .addTo(station_map);

        // Xử lý sự kiện click vào nút "Thêm mới"
        // addButton.addEventListener('click', () => {
        //     alert('Điểm đã được thêm!');
        //     popup.remove(); // Đóng popup sau khi nhấn nút
        // });
    });
}

function add_ms_from_map() {
    clear_form();
    $("#content-box__station-map").addClass('d-none');
    $("#content-box__station-add").removeClass('d-none');

    $("#ms-long").val(temp_long);
    $("#ms-lat").val(temp_lat);
}

var wqi_lookup_cache;
var params_cache;

function init_config_tab() {
    $("#config-loading-box").removeClass('d-none');

    $.ajax({
        url: '/apps/wqm/api/wqi_lookup/',
        method: 'GET',
        success: function(res) {
            wqi_lookup_cache = res['data'];
            fill_wqi_lookup_to_table();
            add_wqi_update_btn_click();
            add_wqi_cancel_btn_click();
            add_wqi_save_btn_click();
            get_email_config();

            $("#config-loading-box").addClass('d-none');
        },
    });
}

init_license_tab();

$(document).ready(function() {
    $('#search-ms-water-point-modal').on('input', function() {
        var searchValue = $(this).val().toLowerCase();
        $('#ms-water-point li').each(function() {
            var listItemText = $(this).text().toLowerCase();
            if (listItemText.indexOf(searchValue) !== -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});
