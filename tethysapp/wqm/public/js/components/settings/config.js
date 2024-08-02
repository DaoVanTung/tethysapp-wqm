function fill_wqi_lookup_to_table() {
    let data = wqi_lookup_cache;
    let wqi_lookup_table_body = $("#wqi-lookup-table tbody");
    wqi_lookup_table_body.empty();

    data.forEach(e => {
        wqi_lookup_table_body.append(
            `
            <tr item-id="${e.id}">
                <td>
                    <span class="">${e.tieu_de}</span>
                </td>
                <td>
                    <span class="">${e.gia_tri_thap_nhat}</span>
                </td>
                <td>
                    <span class="">${e.gia_tri_cao_nhat}</span>
                </td>
                <td>
                    <input type="text" name="wqi-text-${e.id}" class="form-control wqi-update-input input-desc" value="${e.mo_ta}" readonly>
                </td>
                <td class="td-color">
                    <div class="circle-color" style="background: ${e.mau_sac};"></div>
                    <input type="text" name="wqi-color-${e.id}" class="form-control wqi-update-input input-color" value="${e.mau_sac}" readonly>
                </td>
            </tr>
            `
        );
    });

}

function add_wqi_update_btn_click() {

    $("#wqi-lookup-update-btn").on('click', function () {
        $(".wqi-update-input").addClass('active');
        $(".wqi-update-input").prop('readonly', false);

        $("#wqi-lookup-update-btn").addClass('d-none');
        $(".td-color .circle-color").addClass('d-none');

        $("#wqi-lookup-cancel-btn").removeClass('d-none');
        $("#wqi-lookup-save-btn").removeClass('d-none');
    });
}

function add_wqi_cancel_btn_click() {
    $("#wqi-lookup-cancel-btn").on('click', function () {

        $(".wqi-update-input").removeClass('active');
        $(".wqi-update-input").prop('readonly', true);

        $("#wqi-lookup-update-btn").removeClass('d-none');
        $(".td-color .circle-color").removeClass('d-none');

        $("#wqi-lookup-cancel-btn").addClass('d-none');
        $("#wqi-lookup-save-btn").addClass('d-none');
        fill_wqi_lookup_to_table();
    });
}

function add_wqi_save_btn_click() {
    $("#wqi-lookup-save-btn").on('click', function () {

        let data = {};
        let check_change = false;

        // Lấy giá trị của input hiện tại
        $("#wqi-lookup-table tbody tr").each(function () {

            let item_id = parseInt($(this).attr('item-id'));
            let desc = $(this).find('.input-desc').val().trim();
            let color = $(this).find('.input-color').val().trim();

            let item_cache = wqi_lookup_cache.find(item => item.id == item_id);
            
            if (item_cache.mo_ta.trim() != desc || item_cache.mau_sac.trim() != color) {
                item_cache.mo_ta = desc;
                item_cache.mau_sac = color;
                data[item_id] =
                {
                    mo_ta: desc,
                    mau_sac: color,
                };
                check_change = true;
            }
        });

        // Ẩn nút Hủy bỏ và Lưu

        const form_data = new FormData();
        form_data.append(
            "data",
            JSON.stringify(data)
        );

        $("#wqi-lookup-cancel-btn").click();

        if (!check_change) {return;}


        // Gọi api cập nhật
        $.ajax({
            url: '/apps/wqm/api/update_wqi_lookup/',
            type: 'POST',
            data: form_data,
            headers: {
                'X-CSRFToken': get_cookie('csrftoken') // Thêm mã thông báo CSRF vào header
            },
            processData: false,
            contentType: false,
            cache: false,
            enctype: "multipart/form-data",
            success: function (res) {
                console.log(res);
            },
        });
    });

}