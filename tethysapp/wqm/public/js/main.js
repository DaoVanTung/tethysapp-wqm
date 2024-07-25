
function create_map(map_container) {
    var map = new maplibregl.Map({
        container: map_container,
        style: {
            version: 8,
            sources: {
                "becagisSource": {
                    type: "raster",
                    tiles: ["https://maps.becagis.vn/tiles/basemap/light/{z}/{x}/{y}.png"],
                    tileSize: 256,
                },
                "diem_khai_thac": {
                    type: "vector",
                    tiles: ["https://martin.mkdc.vn/table.public.diem_khai_thac_nuoc.geom/{z}/{x}/{y}"],
                },
                "diem_quan_trac": {
                    type: "vector",
                    tiles: ["https://martin.mkdc.vn/table.public.diem_quan_trac.geom/{z}/{x}/{y}"],
                },
            },
            layers: [
                {
                    id: "becagisLayer",
                    type: "raster",
                    source: "becagisSource",
                    minzoom: 0,
                    maxzoom: 22,
                    paint: {
                        'raster-opacity': 0.5
                    }
                },
            ],
        },
        center: [104.9, 10.2],
        maxBounds: [
            [100.5, 8.0],
            [110.5, 11.5],
        ],
        zoom: 6,
    });

    map.addControl(new maplibregl.NavigationControl());

    map.on("load", async function () {
        const imagePromises = [
            map.loadImage("/static/wqm/images/diem_quan_trac.png"),
            map.loadImage("/static/wqm/images/diem_khai_thac.png"),

        ];

        Promise.all(imagePromises).then(images => {
            map.addImage("diem_quan_trac_icon", images[0].data);
            map.addImage("diem_khai_thac_icon", images[1].data);

            map.addLayer(
                {
                    id: "diem_khai_thac_layer",
                    type: "symbol",
                    source: "diem_khai_thac",
                    "source-layer": "table.public.diem_khai_thac_nuoc.geom",
                    layout: {
                        "icon-image": "diem_khai_thac_icon",
                        "icon-size": 0.4,
                    },

                    filter: [">=", ["to-number", ["get", "luu_luong_khai_thac"]], 3000]
                }
            );

            map.addLayer(
                {
                    id: "diem_quan_trac_layer",
                    type: "symbol",
                    source: "diem_quan_trac",
                    "source-layer": "table.public.diem_quan_trac.geom",
                    layout: {
                        "icon-image": "diem_quan_trac_icon",
                        "icon-size": 0.4,
                    },
                }
            );

            map.on("mouseenter", "diem_quan_trac_layer", function () {
                map.getCanvas().style.cursor = "pointer";
            });

            map.on("mouseleave", "diem_quan_trac_layer", function () {
                map.getCanvas().style.cursor = "";
            });

            // Thay đổi con trỏ chuột khi di chuyển qua điểm
            map.on("mouseenter", "diem_khai_thac_layer", function () {
                map.getCanvas().style.cursor = "pointer";
            });

            // Thay đổi con trỏ chuột về lại ban đầu khi rời khỏi điểm
            map.on("mouseleave", "diem_khai_thac_layer", function () {
                map.getCanvas().style.cursor = "";
            });
        });
    });

    return map;
}

function hide_layer(layer_id) {
    map.setLayoutProperty(layer_id, 'visibility', 'none');
}