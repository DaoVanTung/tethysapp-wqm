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


$('.menu-box__item').on('click', function () {
    show_content($(this).attr('id'));
});

function get_license_data() {
    $.ajax({
        'url': '/apps/wqm/api/licenses/',
        'method': 'GET',
        'success': function (res) {
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
        'success': function (res) {
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

    if (content_id === 'menu-config' && station_cache.length == 0) {
        init_config_tab();
        init_config_tab = true;
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
    add_ms_layer(license_map, 0.35);
    add_water_point_layer(license_map, 0.35);
    add_license_map_click_event(license_map);
}

function init_station_tab() {
    $("#station-loading-box").removeClass('d-none');
    get_ms_data();
}

function init_config_tab() {
    console.log('init config tab');
}

init_license_tab();
