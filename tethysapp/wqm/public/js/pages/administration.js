$(".menu-box__item").on("click", function () {
    show_content($(this).attr("id"));
});

function show_content(content_id) {
    // Tìm thẻ đang select
    let menu_item_selected = $(".menu-box__item.active").attr("id");

    if (content_id === menu_item_selected) {
        return;
    }

    $(".menu-box__item.active").removeClass("active");
    $(".menu-box__item.active").removeClass("active");
    $(`#content-${menu_item_selected}`).addClass("d-none");
    $(`#content-${content_id}`).removeClass("d-none");
    $(`#${content_id}`).addClass("active");
}