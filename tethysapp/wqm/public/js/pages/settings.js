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
var monitor_station_cache = [];
var monitor_station_table = null;

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
            monitor_station_cache = res['data'];
            fill_monitor_station_to_table();
        }
    });    
}

function show_content(content_id) {
    let menu_item_selected = $('.menu-box__item.active').attr('id');

    if (content_id === menu_item_selected) {
        return;
    }

    if (content_id === 'menu-station' && station_cache.length == 0) {
        get_ms_data();
    }

    if (content_id === 'menu-station' && station_cache.length == 0) {
        get_ms_data();
    }

    $('.menu-box__item.active').removeClass('active');
    $('.menu-box__item.active').removeClass('active');
    $(`#content-${menu_item_selected}`).addClass('d-none');
    $(`#content-${content_id}`).removeClass('d-none');
    $(`#${content_id}`).addClass('active');
}

get_license_data();