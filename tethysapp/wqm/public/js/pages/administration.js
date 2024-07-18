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

var min_date;
var max_date;

$.ajax({
    'url': '/apps/wqm/api/licenses/',
    'method': 'GET',
    'success': function (res) {
        console.log(res);
        licenses_cache = res['data'];
        licenses_total = licenses_cache.length;
        fill_licenses_to_table();
        analysis_licenses();
    }
});

function analysis_licenses() {
    licenses_cache.forEach(element => {
        let end_date = new Date(Date.parse(element['ngay_het_han']));
        let today = new Date();
        let next_30_day = new Date();
        next_30_day.setDate(today.getDate() + 30);

        if (end_date < today) {
            licenses_expired += 1;
        } else if (end_date > today && end_date < next_30_day) {
            licenses_expiring_soon += 1;
        } else {
            licenses_valid += 1;
        }
    });

    $('#licenses-total').text(licenses_total);
    $('#licenses-valid').text(licenses_valid);
    $('#licenses-expiring-soon').text(licenses_expiring_soon);
    $('#licenses-expired').text(licenses_expired);

}

function fill_licenses_to_table() {
    let data = licenses_cache;

    if (licenses_table !== null) {
        licenses_table.destroy();
        licenses_table = null;
        $('#licenses-table tbody').off();
    }

    licenses_table = $('#licenses-table').DataTable({
        data: data,
        // searching: false,
        language: {
            zeroRecords: 'Không có kết quả tìm kiếm phù hợp',
            "lengthMenu": "Số giấy phép cho mỗi trang _MENU_", // Tùy chỉnh text "entries per page"
            "info": "Đang hiển thị _START_ đến _END_ của _TOTAL_ giấy phép",
            "search": "Tìm kiếm",
        },
        pageLength: 25,
        order: [[1, 'asc']],
        columnDefs: [
            { targets: 0, visible: false } // Ẩn cột id
        ],
        columns: [
            {
                "targets": 0,
                title: "STT",
                "render": function (data, type, full, meta) {
                    return meta.row + 1; // Trả về số thứ tự
                }
            },
            {
                data: "so_hieu_van_ban",
                title: "Số hiệu văn bản",
                width: '180px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "ngay_ban_hanh",
                title: "Ngày ban hành",
                width: '160px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    let datetime = new Date(Date.parse(data));
                    return datetime.toLocaleDateString("vi-VN");
                },
            },
            {
                data: "ngay_het_han",
                title: "Ngày hết hạn",
                width: '160px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    let datetime = new Date(Date.parse(data));
                    return datetime.toLocaleDateString("vi-VN");
                },
            },
            {
                data: "loai_giay_phep",
                title: "Loại giấy phép",
                width: '280px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    return data;
                },
            },
            {
                data: "ten_to_chuc_ca_nhan",
                title: "Tên tổ chức/cá nhân",
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "id",
                title: "",
                width: '100px',
                searchable: false,
                orderable: false,
                render: (data, type, row) => {
                    return `
                    <div class='d-flex'>
                        <button type="button" class="btn btn-success" onclick="on_view_license_button_click()">Xem</button>
                        <button type="button" class="btn"><i class="bi bi-trash-fill"></i></button>
                    </div>
                    `;
                },
            },
        ]
    });

    // addSearchResultEvent();
}

function on_view_license_button_click() {
    $('#content-box__license-detail').removeClass('d-none');
    $('#content-box__license').addClass('d-none');
}

function on_close_license_detail_click() {
    $('#content-box__license').removeClass('d-none');
    $('#content-box__license-detail').addClass('d-none');
}