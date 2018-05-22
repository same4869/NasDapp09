var UserInfoBean = function(text){
    if(text){
       var obj = JSON.parse(text);
       this.name = obj.name; //用户昵称，写钱包地址
       this.lng = obj.lng; //用户的上一次经度
       this.lat = obj.lat; //用户的上一次纬度
       this.dist = obj.dist; //用户目前积累的距离
    }
};

var UserInfoBeans = function () {
    LocalContractStorage.defineMapProperty(this, "arrayList");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "userInfos", {
        parse: function (text) {
            return new UserInfoBean(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
}

UserInfoBeans.prototype ={
    init:function(){
        this.size = 0;
    },

   //初始化数据结构，记录用户的经纬度,返回最新距离
   saveLngAndLat:function(lng, lat){
        var from = Blockchain.transaction.from;
        var userInfoBean = this.userInfos.get(from);
        if (!userInfoBean) {
            userInfoBean = {};
            userInfoBean.lng = lng;
            userInfoBean.lat = lat;
            userInfoBean.name = from;
            userInfoBean.dist = 0;
            this.arrayList.set(this.size, from);
            this.size += 1
            LocalContractStorage.set("size", this.size);
        }

        userInfoBean.lng = lng;
        userInfoBean.lat = lat;
        userInfoBean.name = from;

        this.userInfos.put(from,userInfoBean);

        return userInfoBean.dist;
   },

   //获得用户上一次的经纬度
   getLastLngAndLat:function(address){
        var userInfoBean = this.userInfos.get(address);

        if(!userInfoBean){
            return null
        }

        var items = [];
        items.push(userInfoBean.lng);
        items.push(userInfoBean.lat);

        return items;
   },

   //更新用户距离
   updateUserDis:function(dist){
        var from = Blockchain.transaction.from;
        var userInfoBean = this.userInfos.get(from);
        if(userInfoBean){
            userInfoBean.dist += dist;
        }
        this.userInfos.put(from,userInfoBean);
   },

   //更新用户经纬度与距离
   updateUserInfo:function(lng, lat, dist){
        var from = Blockchain.transaction.from;
        var userInfoBean = this.userInfos.get(from);
        if (!userInfoBean) {
            userInfoBean = {};
            userInfoBean.lng = lng;
            userInfoBean.lat = lat;
            userInfoBean.name = from;
            userInfoBean.dist = 0;
            this.arrayList.set(this.size, from);
            this.size += 1
            LocalContractStorage.set("size", this.size);
        }

        userInfoBean.lng = lng;
        userInfoBean.lat = lat;
        userInfoBean.name = from;
        userInfoBean.dist += dist;

        this.userInfos.put(from,userInfoBean);

        return userInfoBean.dist;
   },

   //返回所有用户的名字和距离
   getAllInfo:function(){
    this.size = LocalContractStorage.get("size", this.size);
    var info = []
    var key
    for(var i = 0; i < this.size; i++){
        key = this.arrayList.get(i);
        info.push(this.userInfos.get(key))
    }
    return info;
}
}

module.exports = UserInfoBeans;