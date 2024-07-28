var wqi_lookup_cache;
var params_cache;

$.ajax({
    url: '/apps/wqm/api/wqi_lookup/',
    method: 'GET',
    success: function (res) {
        console.log(res);
        wqi_lookup_cache = res['data'];
        fill_wqi_lookup_to_table();
    },
});

function fill_wqi_lookup_to_table() {
    let data = wqi_lookup_cache;
    let wqi_lookup_table_body = $("#wqi-lookup-table tbody");
    
    data.forEach(e => {
        wqi_lookup_table_body.append(
            `
            <tr>
                <td>
                    <span class="">${e.tieu_de}</span>
                </td>
                <td>
                    <span class="">${e.mo_ta}</span>
                </td>
                <td>
                    <span class="">${e.gia_tri_thap_nhat}</span>
                </td>
                <td>
                    <span class="">${e.gia_tri_cao_nhat}</span>
                </td>
                <td class="td-color">
                    <div class="circle-color" style="background: ${e.mau_sac};"></div>
                    <span class="">${e.mau_sac}</span>
                </td>
            </tr>
            `
        );
    });
}


// $.ajax({
//     url: '/apps/wqm/api/parameters/',
//     method: 'GET',
//     success: function (res) {
//         console.log(res);
//         params_cache = res['data'];
//         fill_params_to_table();
//     },
// });

// function fill_params_to_table() {
//     let data = params_cache;
//     let params_table_body = $("#params-table tbody");
    
//     data.forEach(e => {
//         params_table_body.append(
//             `
//             <tr>
//                 <td>
//                     <span class="">${e.ma_thong_so}</span>
//                 </td>
//                 <td>
//                     <span class="">${e.ten_thong_so}</span>
//                 </td>
//                 <td>
//                     <span class="">${e.don_vi}</span>
//                 </td>
//                 <td>
//                     <span class="">${e.gia_tri_thap_nhat != null ? e.gia_tri_thap_nhat : ''}</span>
//                 </td>
//                 <td>
//                     <span class="">${e.gia_tri_cao_nhat != null ? e.gia_tri_cao_nhat : ''}</span>
//                 </td>
//             </tr>
//             `
//         );
//     });
// }