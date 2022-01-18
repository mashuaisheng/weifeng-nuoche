// pages/index.js
var url = 'https://viefong.com:8443/';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        latitude:null,
        address:null,
        longitude:null,
    },
 
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getUserLocation(options);//授权
        // var options='p={+"codeId" : "ho3acJ6K23gqo4c5"}'
    },
    //授权地理位置
    getUserLocation: function (options) {
        let vm = this;
        wx.getSetting({
            success: (res) => {
                // console.log(JSON.stringify(res))
                // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
                // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
                // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
                if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
                    //授权框
                    wx.showModal({
                    title: '请求授权当前位置',
                    content: '需要获取您的地理位置，请确认授权',
                    success: function (res) {
                        if (res.cancel) {
                            //取消授权
                            wx.showToast({
                                title: '您已拒绝授权',
                                icon: 'none',
                                duration: 2000
                            })
                        } else if (res.confirm) {
                            //确认授权 调起客户端小程序设置界面
                            wx.openSetting({
                                success: function (dataAu) {
                                    if (dataAu.authSetting["scope.userLocation"] == true) {
                                        //设置成功
                                        wx.showToast({
                                            title: '授权成功',
                                            icon: 'success',
                                            duration: 1000
                                        })
                                        //再次授权，调用wx.getLocation的API
                                        vm.getLocation(options);
                                    } else {
                                        //设置失败
                                        wx.showToast({
                                            title: '授权失败',
                                            icon: 'none',
                                            duration: 1000
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
                } else if (res.authSetting['scope.userLocation'] == undefined) {
                    //调用wx.getLocation的API
                    vm.getLocation(options);
                }else {
                    //调用wx.getLocation的API
                    vm.getLocation(options);
                }
            }
        })
    },
    //调用wx.getLocation的API
    getLocation: function(options) {
        // let result =decodeURIComponent(options.q).replace(/\+/g,"");//解析二维码信息
        // console.log(result)
        const that = this
        wx.getLocation({
            type: 'gcj02',
            altitude: true,
            isHighAccuracy: true,
            highAccuracyExpireTime: 2000,
            success: function(res) {
                // console.log(res)
                that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude
                })
                // 构建请求地址
                // 逆解析接口 /ws/geocoder/v1
                var qqMapApi = 'https://apis.map.qq.com/ws/geocoder/v1/' + "?location=" + that.data.latitude + ',' +
                that.data.longitude + "&key=" + 'ONSBZ-R5NWF-RCZJF-N5U5O-BVI35-OJFT4' + "&get_poi=1";

                that.sendRequest(qqMapApi,options);
            },
            fail: function() {
                wx.showToast({
                title: '获取位置信息失败',
                icon: 'none'
                })
            }
        })
    },
    //具体地址
    sendRequest:function(qqMapApi,options) {
        const that = this
        wx.request({
        url: qqMapApi,
        header: {
            'Content-Type': 'application/json'
        },
        data: {},
        method:'GET',
        success: (res) => {
            // console.log(res)
            if (res.statusCode == 200 && res.data.status == 0) {
                // 从返回值中提取需要的业务地理信息数据 国家、省、市、县区、街道
                that.setData({ nation: res.data.result.address_component.nation });
                that.setData({ province: res.data.result.address_component.province });
                that.setData({ city: res.data.result.address_component.city });
                that.setData({ district: res.data.result.address_component.district });
                that.setData({ street: res.data.result.address_component.street });
                that.setData({ address: res.data.result.address });
            }
            that.verification(options);//验证码二维码信息的方法
        }
        })
    },
    //验证获取位置后，开始验证二维码
    verification(options){
        let result =decodeURIComponent(options.q).replace(/\+/g,"");//解析二维码信息
            wx.setStorage({//存储到本地
                key:"latitude",
                data:this.data.latitude
            })
            wx.setStorage({//存储到本地
                key:"longitude",
                data:this.data.longitude
            })
            // const str ='p={"codeId":"ho3acJ6K23gqo4c5"}' p={%22codeId%22:%22ho3acJ6K23gqo4c5%22}
            if(result!=='undefined'){
                //如果用户使用微信扫码则直接跳转到下一个页面
                // console.log("扫码进入")
                let ret= result.replace(/\s/g,"").replace(/\n/g, "").replace(/\+/g,"");
                let weiFeng_userId = ret.split('p=')[1]
                wx.setStorageSync('weiFeng_userId', JSON.parse(weiFeng_userId).codeId)
                wx.request({
                    url: url+'app/common/v1/getUserCodeEffective',
                    data:{
                        codeId: wx.getStorageSync('weiFeng_userId')
                    },
                    success: res => {
                        // console.log(latitude)
                        //判断接口返回值和是否激活二维码 && res.data.data.isBind!=null
                        if (res.data.rescode === 100) {
                            console.log(res.data.data)
                            if(res.data.data.codeCategory==1){
                                wx.showToast({
                                    title: '请稍等...',
                                    icon: 'success',
                                    duration: 2000
                                })
                                //延迟返回页面
                                setTimeout(function () {
                                    wx.reLaunch({url: '/pages/result/result'})
                                },2000)
                            }else if(res.data.data.codeCategory==2){
                                wx.showToast({
                                    title: '门铃二维码',
                                    icon: 'none',
                                    duration: 2000
                                })
                                // //延迟返回页面
                                // setTimeout(function () {
                                //     wx.reLaunch({url: '/pages/do/result'})
                                // },2000)
                            }else{
                                wx.showToast({
                                    title: '无效二维码',
                                    icon: 'none',
                                    duration: 2000
                                })
                            }
                            
                        }else{
                            //失效二维码提示信息
                            wx.showToast({
                                title: '请求错误',
                                icon: 'error',
                                duration: 2000
                            })
                        }
                    },
                    fail: err => {
                        console.log(err)
                    }
                })
            }else{
                //正常运行，走扫码功能----scanCode()
                setTimeout(
                    function () {
                        // console.log('openID:' + wx.getStorageSync('openid'))
                     },
                2000)
                
            }
    },
    
    // 扫码功能
    scanCode:function() {
        //检查是否调用接口获取用户的唯一标识openId
        if (wx.getStorageSync('openid')) {
            wx.scanCode({
                success: res => this.dealScanCode(res.result),//成功则判断二维码链接
                //失败则返回原页面
                fail: (e) => {
                    if (e && e.errMsg && e.errMsg.indexOf('scanCode:fail cancel') != -1) {
                        return;
                    }
                    wx.showToast({ title: '扫码失败', icon: 'none', duration: 2000 })
                }
            })
        } else {
            //未获取用户的唯一标识
            wx.showToast({
                title: '未获取到您的信息,请尝试重新进入小程序',
                icon: 'none',
                duration: 3000
            })
        }
    },
    // 判断连接
    dealScanCode: function(result) {
        if (!result || !result.lastIndexOf) {
            wx.showToast({ title: '二维码失效', icon: 'none', duration: 2000 })
            return;
        }
        // 具体的连接处理
        if (result.lastIndexOf('p=') != -1) {
            this.bindAccount(result);
            return;
        }
        // 无效的二维码
        wx.showToast({ title: '二维码失效', icon: 'none', duration: 2000 })
    },
    // 处理连接
    bindAccount: function(result) {
        let weiFeng_userId = result.split('p=')[1];
        wx.setStorageSync('weiFeng_userId', JSON.parse(weiFeng_userId).codeId)
        wx.request({
            url: url+'app/common/v1/getUserCodeEffective',
            data:{
                codeId: wx.getStorageSync('weiFeng_userId')
            },
            success: res => {
                //判断接口返回值和是否激活二维码 && res.data.data.isBind!=null
                if (res.data.rescode === 100) {
                    if(res.data.data.codeCategory==1){
                        wx.reLaunch({url: '/pages/result/result'})
                    }else{
                        wx.reLaunch({url: '/pages/download/download'})
                    }
                    
                }else{
                    //失效二维码提示信息
                    wx.showToast({
                        title: '请求错误',
                        icon: 'error',
                        duration: 2000
                    })
                }
            },
            fail: err => {
                console.log(err)
            }
        })


    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})