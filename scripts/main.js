$(window).on('load', function () {
    'use strict';
    var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
        window.location.hostname === '[::1]' ||
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ('serviceWorker' in navigator &&
        (window.location.protocol === 'https:' || isLocalhost)) {
        navigator.serviceWorker.register('service-worker.js')
            .then(function (registration) {
                registration.onupdatefound = function () {
                    if (navigator.serviceWorker.controller) {
                        var installingWorker = registration.installing;
                        installingWorker.onstatechange = function () {
                            switch (installingWorker.state) {
                                case 'installed':
                                    break;
                                case 'redundant':
                                    throw new Error('The installing ' +
                                        'service worker became redundant.');
                                default:
                            }
                        };
                    }
                };
            }).catch(function (e) {
                console.error('Error during service worker registration:', e);
            });
    }

    // Your custom JavaScript goes here

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
    var $favorite = $('#favorite');
    var $add = $('#add');
    var speed = 300;
    var now_place;
    var map;
    var panorama;
    var status = 0;
    var geocoder = new google.maps.Geocoder();
    var db = firebase.firestore();
    const settings = {/* your settings... */ timestampsInSnapshots: true };
    db.settings(settings);
    var posRef = db.collection('latlng');


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
        var latlng = {
            lat: lat,
            lng: lon
        };
        return latlng;
    }

    // ストリートビューと地図を表示する関数(引数は座標)
    function initialize(fenway) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: fenway,
            zoom: 6,
            scaleControl: true,
            zoomControl: false,
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP,
            }
        });
        panorama = new google.maps.StreetViewPanorama(
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
        svs.getPanoramaByLocation(randFenway, 5000, function (result, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                //ストリートビューがあれば座標を設定
                var fenway = result.location.latLng;
                // 表示
                $loading.fadeOut(speed);
                $output.fadeIn(speed);
                $tool.fadeIn(speed);
                initialize(fenway);
                now_place = result.location;
                status = 1;
            } else {
                // なければやり直し
                mapsTrip();
            }
        });
    }

    // 最初の画面でスタート
    $go.on('click', function () {
        $ready.fadeOut(speed);
        $loading.fadeIn(speed);
        mapsTrip()
    });

    // スタートボタン
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

    // お気に入り表示
    $favorite.on('click', function () {
        $('#modalArea').fadeIn();
    });

    // お気に入り追加
    $add.on('click', function () {
        $('.super_modal').removeClass('hidden');
        // 表示している場所の座標を取得
        var now_center = panorama.getPosition();
        var f_pos = { lat: now_center.lat(), lng: now_center.lng() }
        // 座標から住所を取得
        geocoder.geocode({
            latLng: f_pos
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0].geometry) {
                    // 住所を取得
                    var address = results[0].formatted_address;
                    // firestoreに追加
                    posRef.add({
                        user: "",
                        title: 'hogehoge',
                        address: address,
                        position: f_pos,
                        timestamp: Date.now()
                    }).then(() => {
                        alert('added!!');
                        $('#modalArea').fadeOut();
                        $('.super_modal').addClass('hidden');
                    }).catch(error => {
                        console.error(error);
                    });
                }
            }
        });
    });

    // お気に入りクリック時に移動
    $('#modalArea').on('click', '.card', function () {
        var id = $(this).attr('id');
        var lat = $('#' + id).find('#lat').text();
        var lng = $('#' + id).find('#lng').text();
        panorama.setPosition(new google.maps.LatLng(lat, lng));
        map.panTo(new google.maps.LatLng(lat, lng));
        $('#modalArea').fadeOut();
    });
    // 削除
    $('#modalArea').on('click', '.delete', function (e) {
        if (confirm('削除しますか??')) {
            $('.super_modal').removeClass('hidden');
            var id = $(this).parent().parent().attr('id');
            posRef.doc(id).delete().then(function () {
                alert("deleted!!");
                $('.super_modal').addClass('hidden');
                e.stopPropagation();
            }).catch(function (error) {
                alert("Error removing document: ", error);
                e.stopPropagation();
            });
            e.stopPropagation();
        } else {
            e.stopPropagation();
            return false;
        }
    });
    // データの監視
    posRef.onSnapshot(function (querySnapshot) {
        var str = "";
        querySnapshot.forEach(function (doc) {
            str +=
                `<div id="${doc.id}" class="card">
                    <div class="title_wrap">
                        <h2 class="title">${doc.data().title}</h2>
                        <h2 class="edit"><i class="material-icons">edit</i>&nbsp;&nbsp;</h2>
                        <h2 class="delete">&nbsp;&nbsp;<i class="material-icons">delete</i></h2>
                    </div>
                    <p class="address">${doc.data().address}</p>
                    <p class="position">lat:<span id="lat">${doc.data().position.lat}</span> lng:<span id="lng">${doc.data().position.lng}</span></p>
                    <p class="user">${doc.data().user}</p>
                </div>`;
        });
        $('#fav_pos').html(str);
    });

    // モーダル
    // $('#openModal').click(function () {
    //     $('#modalArea').fadeIn();
    // });
    $('#closeModal, #back, #modalBg').click(function () {
        $('#modalArea').fadeOut();
    });

});


