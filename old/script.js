/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function () {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
      .then(function (registration) {
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = function () {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            // The updatefound event implies that registration.installing is set:
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            var installingWorker = registration.installing;

            installingWorker.onstatechange = function () {
              switch (installingWorker.state) {
                case 'installed':
                  // At this point, the old content will have been purged and the
                  // fresh content will have been added to the cache.
                  // It's the perfect time to display a "New content is
                  // available; please refresh." message in the page's interface.
                  break;

                case 'redundant':
                  throw new Error('The installing ' +
                    'service worker became redundant.');

                default:
                // Ignore
              }
            };
          }
        };
      }).catch(function (e) {
        console.error('Error during service worker registration:', e);
      });
  }

  // Your custom JavaScript goes here
  var clickEventType = ((window.ontouchstart !== null) ? 'click' : 'touchstart');
  const $title = $('#title');
  const $now = $('#now');
  const $load = $('#load');
  const $map = $('#map');
  const $pano = $('#pano');
  const $here = $('#here');
  const $go = $('#go');
  const $mapBtn = $('#mapBtn');
  const $takeOff = $('#takeOff');

  // 変数の定義
  var randlat_int;
  var randlat_dec;
  var lat;
  var select_lat;
  var randlon_int;
  var randlon_dec;
  var lon;
  var select_lon;
  var fenway = {};
  var randFenway = {};
  var map;
  var panorama;
  var mapcanvas;
  var mapOptions;
  var stcanvas;
  var StreetViewPanoramaOptions;
  var svs;
  var mapStatus = 0;

  // マップを描画する関数
  function drawMap(zoom) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: fenway,
      zoom: zoom,
      scaleControl: true,
      zoomControl: false,
      streetViewControl: true,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
      },
    });
  }
  // ストリートビューを描画する関数
  function drawStreetview() {
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
        panControl: false,
      });
    map.setStreetView(panorama);
  }
  // 緯度経度を乱数で決定する関数
  function getPlace() {
    randlat_int = Math.floor(Math.random() * (90 - 0) + 0);
    randlat_dec = Math.random();
    lat = randlat_int + randlat_dec;
    select_lat = Math.floor(Math.random() * 2) + 0;
    randlon_int = Math.floor(Math.random() * (180 - 0) + 0);
    randlon_dec = Math.random();
    lon = randlon_int + randlon_dec;
    select_lon = Math.floor(Math.random() * 2) + 0;
    // プラスとマイナスを調整
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
  }

  //ストリートビューを探す関数
  function mapsTrip() {
    //座標をランダムに生成する関数
    getPlace();
    // ストリートビューがあるかどうか確認
    svs = new google.maps.StreetViewService()
    svs.getPanoramaByLocation(randFenway, 500, function (result, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        //ストリートビューがあれば座標を設定
        fenway = result.location.latLng;
        mapStatus = 1;
        // 要素の表示
        $load.fadeOut(500);
        $now.fadeIn(500);
        $takeOff.fadeIn(500);
        $mapBtn.fadeIn(500);
        // マップ描画(要素の表示後じゃないとマップがいい感じに表示されない)
        drawMap(6);
        // ストリートビュー描画
        drawStreetview();
      } else {
        // なければやり直し
        mapsTrip();
      }
    });
  };

  //ボタン押して地図の表示非表示
  $mapBtn.on(clickEventType, function () {
    var zIn = $map.css('z-index');
    if (zIn == 5) {
      $map.css('z-index', 50);
    } else {
      $map.css('z-index', 5);
    }
  });

  // 現在地を探す
  $here.on(clickEventType, function () {
    // タイトルを非表示
    $title.fadeOut(500);
    $load.fadeIn(500);
    //地図が表示されていたら非表示にする
    var zIn = $map.css('z-index');
    if (zIn == 50) {
      $map.animate({
        'z-index': '5',
      }, 500);
    }
    mapStatus = 0;
    // 位置情報取得して表示する関数
    initialize();
  });

  //座標を探す
  $takeOff.add($go).on(clickEventType, function () {
    // タイトル非表示
    $title.fadeOut(500);
    // ボタン非表示
    $takeOff.fadeOut(500);
    $mapBtn.fadeOut(500);
    // コンテンツ非表示
    $now.fadeOut(500);
    // ローディング画面表示
    $load.fadeIn(500);
    //地図が表示されていたら非表示にする
    var zIn = $map.css('z-index');
    if (zIn == 50) {
      $map.animate({
        'z-index': '5',
      }, 500);
    }
    mapStatus = 0;
    // 関数実行
    mapsTrip();
  });

  // マップ上で座標が移動したときの処理
  // google.maps.event.addListener(panorama, 'position_changed', function () {
  //     fenway = panorama.getPosition();
  //     positionCell = panorama.getPosition();
  //     map.panTo(positionCell);
  // });

  //1．位置情報の取得に成功した時の処理
  function mapsInit(position) {
    //lat=緯度、lon=経度 を取得
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    fenway = {
      lat: lat,
      lng: lon
    };
    // いい感じに表示
    $load.fadeOut(500);
    $now.fadeIn(500);
    $takeOff.fadeIn(500);
    $mapBtn.fadeIn(500);
    // マップ描画
    drawMap(14);
    // ストリートビュー描画
    drawStreetview();
  };

  //2． 位置情報の取得に失敗した場合の処理
  function mapsError(error) {
    var e = "";
    if (error.code == 1) { //1＝位置情報取得が許可されてない（ブラウザの設定）
      e = "位置情報が許可されてません";
    }
    if (error.code == 2) { //2＝現在地を特定できない
      e = "現在位置を特定できません";
    }
    if (error.code == 3) { //3＝位置情報を取得する前にタイムアウトになった場合
      e = "位置情報を取得する前にタイムアウトになりました";
    }
    alert("エラー：" + e);
    $title.fadeIn(500);
    $now.fadeOut(500);
    $load.fadeOut(500);
  };

  //3.位置情報取得オプション
  var set = {
    enableHighAccuracy: true, //より高精度な位置を求める
    maximumAge: 20000, //最後の現在地情報取得が20秒以内であればその情報を再利用する設定
    timeout: 10000 //10秒以内に現在地情報を取得できなければ、処理を終了
  };

  //Main:位置情報を取得する関数 //getCurrentPosition :or: watchPosition
  function initialize() {
    navigator.geolocation.getCurrentPosition(mapsInit, mapsError, set);
  }

})();
