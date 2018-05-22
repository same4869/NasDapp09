$(function () {
    var dappContactAddress;
    var serialNumber;
    var NebPay;
    var nebPay;
    var nebulas;
    dappContactAddress = "n1pFQUFqFSvZx9iybV7pLYWBotTH1KoWu8z";
    nebulas = require("nebulas"), neb = new nebulas.Neb();
    neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
    
    NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
    nebPay = new NebPay();			

    var doc = document,
        latitude = doc.getElementById('latitude'),
        longitude = doc.getElementById('longitude'),
        accuracy = doc.getElementById('accuracy'),
        support = doc.getElementById('support'),
        showDiv = doc.getElementById('show');
        console.log(latitude + " " + longitude)
    var latitudeVaule,longitudeVaule;
    var map;
    var dist;
    function lodeSupport(){
        if(navigator.geolocation){
            support.innerHTML = '“我在”DAPP探测到您本次信息如下（地理隐私数据不会被泄漏给其他人）';
            showDiv.style.display = 'block';
            var geolocation = new BMap.Geolocation(); 
            geolocation.getCurrentPosition(function(r){
                // var latitudeP = position.coords.lat,
                var mk = new BMap.Marker(r.point);  
                latitudeP = r.point.lat;  
                longitudeP = r.point.lng;  
                console.log("latitudeP:" + latitudeP + " longitudeP:" + longitudeP);
                // latitudeP = position.coords.lat,
                // longitudeP = position.coords.lng,
                // accuracyP = position.point.accuracy;
                latitudeVaule = latitudeP;
                longitudeVaule = longitudeP;
                latitude.innerHTML = latitudeP;
                longitude.innerHTML = longitudeP;
                // accuracy.innerHTML = accuracyP;
                //在百度 map中显示地址
                map = new BMap.Map("map_canvas");          // 创建地图实例  
                var point = new BMap.Point(longitudeP , latitudeP);  // 创建点坐标  
                map.centerAndZoom(point, 15);// 初始化地图，设置中心点坐标和地图级别  
                map.enableScrollWheelZoom(true);
                var marker = new BMap.Marker(point);    
                map.addOverlay(marker);  
            },showError);
        }else{
            support.innerHTML = '对不起，当前浏览器不支持该DAPP！';
            showDiv.style.display = 'none';
        }
    }
    function updataPosition(position){
        var latitudeP = position.coords.latitude,
            longitudeP = position.coords.longitude,
            accuracyP = position.coords.accuracy;
        latitudeVaule = latitudeP;
        longitudeVaule = longitudeP;
        latitude.innerHTML = latitudeP;
        longitude.innerHTML = longitudeP;
        accuracy.innerHTML = accuracyP;
        //在百度 map中显示地址
        map = new BMap.Map("map_canvas");          // 创建地图实例  
        var point = new BMap.Point(longitudeP , latitudeP);  // 创建点坐标  
        map.centerAndZoom(point, 15);// 初始化地图，设置中心点坐标和地图级别  
        map.enableScrollWheelZoom(true);
        var marker = new BMap.Marker(point);    
        map.addOverlay(marker); 
        
    }

    function caluDist(lng1,lat1,lng2,lat2){
        var pointA = new BMap.Point(lng1,lat1); 
        var pointB = new BMap.Point(lng2,lat2);
        console.log(map.getDistance(pointA,pointB));
        dist = map.getDistance(pointA,pointB);
        if(dist){
            console.log("dist:" + dist);
            $("#contact_email").text("估算本次提交增加的距离:" + dist + "米");
        }
        var polyline = new BMap.Polyline([pointA,pointB], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});  //定义折线
        map.addOverlay(polyline);     //添加折线到地图上
    }

    function getLastLngAndLat(addr){
            var from = dappContactAddress;
            var value = "0";
            var nonce = "0";
            var gas_price = "1000000";
            var gas_limit = "20000000";
            var callFunction = "getLastLngAndLat";
            var callArgs =  "[\"" + addr + "\"]";
            console.log(callArgs);
            var contract = {
                "function": callFunction,
                "args": callArgs
            };
            neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
                var result = resp.result;   
                console.log("result : " + result);
                result = JSON.parse(result);
                if(result !== null){
                    caluDist(longitudeVaule,latitudeVaule,result[0],result[1]);
                }
                
            }).catch(function (err) {
                console.log("error :" + err.message);
            })
    }

    function saveLngAndLat(lng, lat){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "saveLngAndLat";
        var callArgs = "[\"" + lng + "\",\"" + lat + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, { 
                listener: function (resp) {
                       alert("提交上链成功~");
                }
        }); 
    }

    function updateUserInfo(lng, lat, dist){
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "updateUserInfo";
        var callArgs = "[\"" + lng + "\",\"" + lat + "\",\"" + dist + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, { 
                listener: function (resp) {
                       console.log("resp : " + resp);
                    //    result = JSON.parse(result);
                       alert("提交上链成功~距离增加" + dist + "米");
                }
        }); 
    }

    function showError(error)
    {
        switch(error.code) 
        {
            case error.PERMISSION_DENIED:
                support.innerHTML="用户拒绝对获取地理位置的请求,请刷新浏览器"
                break;
            case error.POSITION_UNAVAILABLE:
                support.innerHTML="位置信息是不可用的,请刷新浏览器"
                break;
            case error.TIMEOUT:
                support.innerHTML="请求用户地理位置超时,请刷新浏览器"
                break;
            case error.UNKNOWN_ERROR:
                support.innerHTML="未知错误,请刷新浏览器"
                break;
        }
    }

    function getAllInfo(){
        var from = dappContactAddress;
        var value = "0";
        var nonce = "0";
        var gas_price = "1000000";
        var gas_limit = "20000000";
        var callFunction = "getAllInfo";
        var callArgs = "";
        //console.log("callFunction:" + callFunction + " callArgs:" + callArgs);
        var contract = {
        "function": callFunction,
        "args": callArgs
        };
        neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        var result = resp.result;   
        console.log("result : " + result);
        result = JSON.parse(result);
        var html = "";
                        var itemList = result;
                        console.log(itemList);
        for(var i = 0, iLen = itemList.length; i < iLen; i++) {
                html += '<li class="item-content">' +
                                '<p>用户：<br>'+ itemList[i].name + '<br>距离：<br>' + itemList[i].dist + '米</p>' +
                                                '</li><HR style="FILTER: alpha(opacity=0,finishopacity=100,style=1)" width="95%" color=#ffffff SIZE=2>';
                                                console.log(html);
        }
        $('#ranklist').append(html);
        }).catch(function (err) {
        console.log("error :" + err.message);
        })
   }

    $("#pre-submit-btn").on("click", function(event) {
        //getLastLngAndLat(address)
        try{   
            // caluDist(longitudeVaule,latitudeVaule,0,0);
            var address = document.getElementById("contact_address").value;
            if(address !== "" && address !== null && map !== null){
                getLastLngAndLat(address)
                console.log("clicked..." + address);
            }else{
                alert("估算距离需要填写您的钱包地址")
            }
        }catch(e){
            alert("请先等待定位成功~")
        }
    });

    $("#submit-btn").on("click", function(event) {
        if(latitudeVaule && longitudeVaule){
            console.log(dist)
            if(dist == 0 || !dist){
                saveLngAndLat(longitudeVaule,latitudeVaule)
            }else{
                updateUserInfo(longitudeVaule,latitudeVaule,dist)
            }
        }else{
            alert("请先等待定位成功~") 
        }
    });

    getAllInfo()
    
    window.addEventListener('load', lodeSupport , true);
})