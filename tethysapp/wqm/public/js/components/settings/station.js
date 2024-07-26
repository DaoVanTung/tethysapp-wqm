const station_charts = {};

function fill_station_to_table() {
    let data = station_cache;

    if (station_table !== null) {
        station_table.destroy();
        station_table = null;
        $('#station-table tbody').off();
    }

    station_table = $('#station-table').DataTable({
        data: data,
        language: {
            zeroRecords: 'Không có kết quả tìm kiếm phù hợp',
            "lengthMenu": "Số điểm quan trắc cho mỗi trang _MENU_",
            "info": "Đang hiển thị _START_ đến _END_ của _TOTAL_ điểm quan trắc",
            "search": "Tìm kiếm",
        },
        pageLength: 25,
        order: [[2, 'asc']],
        columnDefs: [
            { targets: 0, visible: false },
            { targets: 1, visible: false },
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
                data: "trang_thai",
                title: "trang_thai",
                render: (data, type, row, meta) => {
                    return data;
                },
            },
            {
                "targets": 0,
                title: "STT",
                width: '50px',
                "render": function (data, type, full, meta) {
                    return meta.row + 1;
                },
            },
            {
                data: "ma_tram",
                title: "Mã trạm",
                width: '160px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "vi_tri",
                title: "Vị trí",
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "id",
                title: "Điểm khai thác nước liên quan",
                width: '400px',
                render: (data, type, row, meta) => {
                    if (row['cau_hinh_id'] === null) {
                        return "";
                    }

                    const element_id = 'wep-' + row.id;
                    // Lấy dữ liệu 30 ngày
                    $.ajax({
                        url: `/apps/wqm/api/monitoring_station/${row.id}/water_exploitation_points`,
                        method: 'GET',
                        success: function (res) {
                            res['data'].forEach(element => {
                                if (element['ten_cong_trinh_khai_thac'] != null) {

                                    $(`#${element_id}`).append(
                                        `<li style="text-align: start;">${element['ten_cong_trinh_khai_thac']}</li>`
                                    );
                                }

                            });

                        }
                    });

                    return `<ul id="${element_id}" style="max-height: 190px; overflow-x: auto;"></ul>`;
                },
            },
            {
                data: "id",
                title: "Chỉ số WQI 30 ngày gần nhất",
                searchable: false,
                orderable: false,
                width: '400px',
                render: (data, type, row, meta) => {
                    if (row['cau_hinh_id'] === null) {
                        return "";
                    }

                    const chart_id = 'chart-' + row.id;

                    // Lấy dữ liệu 30 ngày
                    $.ajax({
                        url: `/apps/wqm/api/monitoring_station/CB_${row.ma_tram}/wqi/30/`,
                        method: 'GET',
                        success: function (res) {
                            let wqi = {};
                            res['data'].forEach(element => {
                                let date = element['thoi_gian'].split('T')[0];
                                wqi[date] = element['gia_tri'];
                            });


                            try {
                                station_charts[chart_id].destroy();
                            } catch (e) { }

                            station_charts[chart_id] = draw_ms_wqi_chart(wqi, chart_id);
                        }
                    });

                    return `<div class="chart-container"><canvas id="${chart_id}"></canvas></div>`;
                },
            },
            {
                data: "id",
                title: "",
                searchable: false,
                orderable: false,
                width: '96px',
                render: (data, type, row) => {
                    return `
                        <div class='d-flex' style="justify-content: center;">
                            <button type="button" class="btn btn-link" onclick="show_modal_ms_detail('${data}')" data-bs-toggle="modal" data-bs-target="#ms-detail-modal">Chi tiết</button>
                        </div>
                    `;
                },
            },
        ]
    });

    add_filter_station_event();
}


// Thêm sự kiện tìm kiếm
function add_filter_station_event() {
    let search_input = $("#search-station-input");
    if (search_input.length) {
        search_input.on("keyup", function () {
            let search_keyword = search_input.val();
            station_table.search(search_keyword).draw();
        });
    }

    $("#station-province").on('change', function () {
        let province_code = $(this).val();
        if (province_code === "-1") {
            station_table.column(0).search('').draw();
        } else {
            station_table.column(0).search(province_code).draw();
        }
    });

    $("#station-status").on('change', function () {
        let license_status = $(this).val();

        if (license_status === "-1") {
            station_table.column(1).search('').draw();
        } else {
            station_table.column(1).search(license_status).draw();
        }
    });
}