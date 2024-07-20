

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
        language: {
            zeroRecords: 'Không có kết quả tìm kiếm phù hợp',
            "lengthMenu": "Số giấy phép cho mỗi trang _MENU_",
            "info": "Đang hiển thị _START_ đến _END_ của _TOTAL_ giấy phép",
            "search": "Tìm kiếm",
        },

        searching: false,
        pageLength: 25,
        order: [[0, 'asc']],
        columnDefs: [],
        columns: [
            {
                "targets": 0,
                title: "STT",
                "render": function (data, type, full, meta) {
                    return meta.row + 1;
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
                searchable: false,
                orderable: false,
                render: (data, type, row) => {
                    return `
                    <div class='d-flex'>
                        <button type="button" class="btn btn-link" onclick="on_view_license_button_click('${data}')">Chi tiết</button>
                    </div>
                    `;
                },
            },
        ]
    });

    // addSearchResultEvent();
}