let today = new Date();
let next_30_day = new Date();
next_30_day.setDate(today.getDate() + 30);

function analysis_licenses() {
    license_cache.forEach(element => {
        let end_date = new Date(Date.parse(element['ngay_het_han']));

        if (end_date < today) {
            license_expired += 1;
        } else if (end_date > today && end_date < next_30_day) {
            license_expiring_soon += 1;
        } else {
            license_valid += 1;
        }
    });

    $('#license-total').text(license_total.toLocaleString());
    $('#license-valid').text(license_valid.toLocaleString());
    $('#license-expiring-soon').text(license_expiring_soon.toLocaleString());
    $('#license-expired').text(license_expired.toLocaleString());
}


function fill_licenses_to_table() {
    let data = license_cache;

    if (license_table !== null) {
        license_table.destroy();
        license_table = null;
        $('#license-table tbody').off();
    }

    license_table = $('#license-table').DataTable({
        data: data,
        language: {
            zeroRecords: 'Không có kết quả tìm kiếm phù hợp',
            "lengthMenu": "Số giấy phép cho mỗi trang _MENU_",
            "info": "Đang hiển thị _START_ đến _END_ của _TOTAL_ giấy phép",
            "search": "Tìm kiếm",
            "infoEmpty": "Không có giấy phép nào được hiển thị",
            "infoFiltered": "(được lọc từ tổng số _MAX_ giấy phép)"
        },
        searching: true,
        pageLength: 10,
        order: [[2, 'asc']],
        columnDefs: [
            { targets: 0, visible: false },
            { targets: 1, visible: false },
            { targets: 2, visible: false },

        ],

        columns: [
            {
                data: "ma_tinh",
                title: "Mã tỉnh",
                render: (data, type, row, meta) => {
                    return data;
                },
            },
            {
                data: "ngay_het_han",
                title: "Trạng thái",
                render: (data, type, row, meta) => {
                    if (data == null) return "1";

                    let end_date = new Date(Date.parse(data));
                    if (end_date < today) {
                        return "0";
                    }

                    return "1";
                },
            },
            {
                data: "giam_sat",
                title: "Trạng thái giám sát",
                render: (data, type, row, meta) => {
                    if (data === true) {
                        return "1";
                    }

                    return "0";
                },
            },
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
                width: '150px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    let datetime = new Date(Date.parse(data));
                    return datetime.toLocaleDateString("vi-VN");
                },
            },
            {
                data: "ngay_het_han",
                title: "Ngày hết hạn",
                width: '150px',
                render: (data, type, row) => {
                    if (data == null) return "";
                    let end_date = new Date(Date.parse(data));

                    if (end_date < today) {
                        return `
                        <span style="color: #dc3545;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-excel-fill" viewBox="0 0 16 16">
                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64"/>
                        </svg>
                        ${end_date.toLocaleDateString("vi-VN")}
                        
                        </span>`;
                    } else if (end_date > today && end_date < next_30_day) {
                        return `<span style="color: #ffc107;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                        </svg>
                        ${end_date.toLocaleDateString("vi-VN")}
                        </span>`;
                    } else {
                        return `<span style="color: green;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-check-fill" viewBox="0 0 16 16">
                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m1.354 4.354-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
                        </svg>
                        ${end_date.toLocaleDateString("vi-VN")}
                        </span>`;
                    }
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
                    <div class='d-flex' style="justify-content: center;">
                        <button type="button" class="btn btn-link" onclick="on_view_license_button_click('${data}')">Chi tiết</button>
                    </div>
                    `;
                },
            },
        ]
    });

    add_filter_license_event();
}

// Thêm sự kiện tìm kiếm
function add_filter_license_event() {
    let search_input = $("#search-licene-input");
    if (search_input.length) {
        search_input.on("keyup", function () {
            let search_keyword = search_input.val();
            license_table.search(search_keyword).draw();
        });
    }

    $("#license-province").on('change', function () {
        let province_code = $(this).val();
        if (province_code === "-1") {
            license_table.column(0).search('').draw();
        } else {
            license_table.column(0).search(province_code).draw();
        }
    });

    $("#license-status").on('change', function () {
        let license_status = $(this).val();

        if (license_status === "-1") {
            license_table.column(1).search('').draw();
        } else {
            license_table.column(1).search(license_status).draw();
        }
    });

    $("#license-monitor").on('change', function () {
        let license_monitor = $(this).val();

        if ($(this).is(':checked')) {
            license_table.column(2).search('1').draw();
        } else {
            license_table.column(2).search('').draw();
        }
    });
}