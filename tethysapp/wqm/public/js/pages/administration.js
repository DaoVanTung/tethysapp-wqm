$('.menu-box__item').on('click', function () {
    show_content($(this).attr('id'));
});

function show_content(content_id) {
    let menu_item_selected = $('.menu-box__item.active').attr('id');

    if (content_id === menu_item_selected) {
        return;
    }

    $('.menu-box__item.active').removeClass('active');
    $('.menu-box__item.active').removeClass('active');
    $(`#content-${menu_item_selected}`).addClass('d-none');
    $(`#content-${content_id}`).removeClass('d-none');
    $(`#${content_id}`).addClass('active');
}

// Lấy danh sách giấy phép
var licenses_cache = [];
var licenses_table = null;

//  Tổng giấy phép
var licenses_total = 0;

// Giấy phép còn hạn
var licenses_valid = 0;

// Giấy phép sắp hết hạn
var licenses_expiring_soon = 0;

// Giấy phép đã hết hạn
var licenses_expired = 0;

$.ajax({
    'url': '/apps/wqm/api/licenses/',
    'method': 'GET',
    'success': function (res) {
        licenses_cache = res['data'];
        licenses_total = licenses_cache.length;

        fill_licenses_to_table();
        analysis_licenses();
    }
});


// Lấy danh sách điểm quan trắc
var monitor_station_cache = [];
var monitor_station_table = null;

$.ajax({
    'url': '/apps/wqm/api/monitoring_stations/',
    'method': 'GET',
    'success': function (res) {
        monitor_station_cache = res['data'];
        fill_monitor_station_to_table();
    }
});
