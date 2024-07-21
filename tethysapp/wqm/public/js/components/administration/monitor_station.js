const charts = {}; 

function fill_monitor_station_to_table() {
    let data = monitor_station_cache;

    if (monitor_station_table !== null) {
        monitor_station_table.destroy();
        monitor_station_table = null;
        $('#monitor-station-table tbody').off();
    }

    monitor_station_table = $('#monitor-station-table').DataTable({
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
                data: "ma_tram",
                title: "Mã trạm",
                width: '180px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "kinh_do",
                title: "Kinh độ",
                width: '160px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "vi_do",
                title: "Vĩ độ",
                width: '160px',
                render: (data, type, row) => {
                    return data;
                },
            },
            {
                data: "id",
                title: "Điểm khai thác liên quan",
                render: (data, type, row) => {

                    if (data != '9ec1628b-aafe-4673-bad5-3f8e2bae9c8c') {
                        return '';
                    }
                    return `
                    <ul>
                    <li>Trạm cấp nước tập trung Khu vực Tân Mỹ</li>
                    <li>Trong khuôn viên cúa Trạm cấp nước thị trấn Phú Lộc</li>
                    <li>Hệ cấp nước tập trung Trà Set</li>
                    <li>Trạm cấp nước Tắc Cậu</li>
                    </ul>
                    `;
                },
            },
            {
                data: "id",
                title: "Giám sát",
                searchable: false,
                orderable: false,
                render: (data, type, row, meta) => {
                    if (data != '9ec1628b-aafe-4673-bad5-3f8e2bae9c8c') {
                        return '';
                    }
                    const chartId = 'chart-' + meta.row;

                        // Create the chart container element
                        setTimeout(() => {
                            const ctxM = document.getElementById(chartId).getContext('2d');
                            if (charts[chartId]) {
                                charts[chartId].destroy(); // Hủy biểu đồ nếu đã tồn tại
                            }
                            charts[chartId] = new Chart(ctxM, {
                                type: 'line',
                                data: {
                                    labels: ['20/06/2024', '21/06/2024', '22/06/2024', '23/06/2024', '24/06/2024', '25/06/2024', '26/06/2024'],
                                    datasets: [{
                                        label: 'Dữ liệu quan trắc gần đây',
                                        data: [65, 59, 80, 81, 56, 55, 40],
                                        borderColor: 'rgba(75, 192, 192, 1)',
                                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                        borderWidth: 1,
                                        fill: true
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        x: {
                                            display: false
                                        },
                                        y: {
                                            display: false
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            display: false // Ẩn nhãn trên cùng
                                        }
                                    }
                                }
                            });
                        }, 0);

                        return '<div class="chart-container"><canvas id="' + chartId + '"></canvas></div>';
                },
            },
            {
                data: "id",
                title: "",
                searchable: false,
                orderable: false,
                width: '160px',
                render: (data, type, row) => {
                    return `
                    <div class='d-flex'>
                        <button type="button" class="btn btn-link" onclick="">Chi tiết</button>
                    </div>
                    `;
                },
            },
        ]
    });
}

function on_close_btn_click(element_id) {
    $(`#${element_id}`).addClass('d-none');
    $("#content-box__monitor-station").removeClass('d-none');
}

function on_change_tab(element_id) {
    $("#content-box__monitor-station").addClass('d-none');
    $(`#${element_id}`).removeClass('d-none');
}

