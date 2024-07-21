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
            "lengthMenu": "Số điểm quan trắc cho mỗi trang _MENU_",
            "info": "Đang hiển thị _START_ đến _END_ của _TOTAL_ điểm quan trắc",
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
                width: '120px',
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
                width: '400px',
                render: (data, type, row, meta) => {

                    if (meta.row != 1) {
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
                    if (meta.row != 1) {
                        return '';
                    }
                    const chartId = 'chart-' + meta.row;
                    setTimeout(() => {
                        const ctxM = document.getElementById(chartId).getContext('2d');
                        if (charts[chartId]) {
                            charts[chartId].destroy(); // Hủy biểu đồ nếu đã tồn tại
                        }
                        charts[chartId] = new Chart(ctxM, {
                            type: 'line',
                            data: {
                                labels: ['10/06/2024', '11/06/2024', '12/06/2024', '13/06/2024', '14/06/2024', '15/06/2024', '16/06/2024', '17/06/2024', '18/06/2024', '19/06/2024', '20/06/2024', '21/06/2024', '22/06/2024', '23/06/2024', '24/06/2024', '25/06/2024', '26/06/2024', '27/06/2024'],
                                datasets: [{
                                    label: 'Dữ liệu quan trắc gần đây',
                                    data: [0, 65, 59, 80, 81, 56, 55, 40, 65, 34, 76, 34, 98, 12, 65, 76, 10, 87],
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
                width: '78px',
                render: (data, type, row) => {
                    return `
                        <div class='d-flex'>
                            <button type="button" class="btn btn-link" onclick="show_modal_ms_detail('${data}')" data-bs-toggle="modal" data-bs-target="#ms-detail-modal">Chi tiết</button>
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

function show_modal_ms_detail(ms_id) {

    console.log(ms_id);


    const ms_data = monitor_station_cache.find(obj => obj.id === ms_id);

    $('#ms-detail-modal tbody').empty();
    $('#ms-detail-modal').removeClass('d-none');

    // Tạo thẻ tr mới
    var newRow = $('<tr>');
    newRow.append('<td>Mã trạm</td>');
    newRow.append(`<td>${ms_data.ma_tram}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Số hiệu</td>');
    newRow.append(`<td>${ms_data.so_hieu}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Vị trí</td>');
    newRow.append(`<td>${ms_data.vi_tri}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Kinh độ</td>');
    newRow.append(`<td>${ms_data.kinh_do} </td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Vĩ độ</td>');
    newRow.append(`<td>${ms_data.vi_do} </td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    newRow.append('<td>Loại trạm</td>');
    newRow.append(`<td>${ms_data.loai_tram}</td>`);
    $('#ms-detail-modal tbody').append(newRow);

    var newRow = $('<tr>');
    var trang_thai = ms_data.trang_thai === 1 ? 'Đang hoạt động' : 'Không hoạt động';
    newRow.append('<td>Trạng thái</td>');
    newRow.append(`<td>${trang_thai} </td>`);
    $('#ms-detail-modal tbody').append(newRow);

    draw_wqi_detail_chart();
}

var wqi_detail_chart;
function draw_wqi_detail_chart() {
    const data = {
        '2024-06-01': 43,
        '2024-06-02': 85,
        '2024-06-03': 76,
        '2024-06-04': 9,
        '2024-06-05': 42,
        '2024-06-06': 56,
        '2024-06-07': 14,
        '2024-06-08': 98,
        '2024-06-09': 61,
        '2024-06-10': 79,
        '2024-06-11': 34,
        '2024-06-12': 5,
        '2024-06-13': 71,
        '2024-06-14': 88,
        '2024-06-15': 33,
        '2024-06-16': 62,
        '2024-06-17': 97,
        '2024-06-18': 46,
        '2024-06-19': 81,
        '2024-06-20': 2,
        '2024-06-21': 23,
        '2024-06-22': 67,
        '2024-06-23': 54,
        '2024-06-24': 75,
        '2024-06-25': 38,
        '2024-06-26': 92,
        '2024-06-27': 10,
        '2024-06-28': 29,
        '2024-06-29': 84,
        '2024-06-30': 19,
        '2024-07-01': 45
    };

    const labels = Object.keys(data);
    const values = Object.values(data);

    var chartElement = document.getElementById("wqi-detail-chart").getContext("2d");
    try {
        wqi_detail_chart.destroy();
    } catch (e) { }

    wqi_detail_chart = new Chart(chartElement, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'WQI',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Ngày'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'WQI'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false // Ẩn nhãn trên cùng
                }
            }
        }
    });
}
