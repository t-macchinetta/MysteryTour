$(function () {
    // 要素の変数を準備
    var $ready = $('#ready');
    var $loading = $('#loading');
    var $output = $('#output');
    var $tool = $('#tool');
    var $map = $('#map');
    var $pano = $('#pano');
    var $go = $('#go');
    var $start = $('#start');
    var $map_toggle = $('#map_toggle');
    var speed = 300;

    // 緯度経度を乱数で決定する関数
    function getPlace() {
        var lat = Math.floor(Math.random() * (90 - 0) + 0) + Math.random();
        var select_lat = Math.floor(Math.random() * 2) + 0;
        var lon = Math.floor(Math.random() * (180 - 0) + 0) + Math.random();
        var select_lon = Math.floor(Math.random() * 2) + 0;
        // 緯度と経度のプラスとマイナスを調整
        if (select_lat == 1) {
            lat = -lat;
        }
        if (select_lon == 1) {
            lon = -lon;
        }
        // 座標決定
        randFenway = {
            lat: lat,
            lng: lon
        };
        return randFenway;
    }

    // ストリートビューと地図を表示する関数(引数は座標)
    function initialize(fenway) {
        var map = new google.maps.Map(document.getElementById('map'), {
            center: fenway,
            zoom: 6,
            scaleControl: true,
            zoomControl: false,
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP,
            }
        });
        var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), {
                position: fenway,
                pov: {
                    heading: 34,
                    pitch: 10,
                    zoom: 0,
                },
                showRoadLabels: false,
                addressControl: true,
                motionTracking: false,
                motionTrackingControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP,
                },
                zoomControl: false,
                panControl: false
            });
        map.setStreetView(panorama);
    }

    //ストリートビューを探す関数
    function mapsTrip() {
        //座標をランダムに生成する関数
        var randFenway = getPlace();
        // ストリートビューがあるかどうか確認
        var svs = new google.maps.StreetViewService();
        svs.getPanoramaByLocation(randFenway, 500, function (result, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                //ストリートビューがあれば座標を設定
                var fenway = result.location.latLng;
                // 表示
                $loading.fadeOut(speed);
                $output.fadeIn(speed);
                $tool.fadeIn(speed);
                initialize(fenway);
            } else {
                // なければやり直し
                mapsTrip();
            }
        });
    }

    $go.on('click', function () {
        $ready.fadeOut(speed);
        $loading.fadeIn(speed);
        mapsTrip();
    });

    // スタート
    $start.on('click', function () {
        $output.hide(speed);
        $tool.hide(speed);
        $loading.fadeIn(speed);
        $map.removeClass('z_1000');
        mapsTrip();
    });

    // マップ表示切り替え
    $map_toggle.on('click', function () {
        $map.toggleClass('z_1000');
    });

});
