// pages/result/result.js
var utils = require('../../utils/util');
var time = require('../../utils/utils');
var url = 'https://viefong.com:8443/';
Page({
    /**
     * 页面的初始数据
     */
    data: {
        messageState: "",//消息内容
        messageStateNumber: 5,//消息状态
        loadIcon: "load.gif",
        timer: '', // 定时器名字
        countDownNum: 60, // 倒计时初始值
        goBack_btn: false, // 返回首页按钮是否展示

        la2: null,//接口的精度
        lo2: null,//接口的纬度
        effectiveDur: null,//距离范围
        startTime: null,//时间
        s:null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log("全局onLaunch options==" + JSON.stringify(options))
        let q = decodeURIComponent(options.q)
        // console.log('q', q)
        if (q && q !== 'undefined') {
            //   console.log("参数 flag=" + utils.getQueryString(q, 'flag'))
            wx.setStorageSync('weiFeng_userId', utils.getQueryString(q, 'flag'))
            this.latlng();
        } else {
            this.latlng();
        }
    },
    //验证经纬度范围和二维码时间
    latlng() {
        var la1 = wx.getStorageSync('latitude')
        var lo1 = wx.getStorageSync('longitude')
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
                    this.setData({
                        la2: res.data.data.latitude,
                        lo2: res.data.data.longitude,
                        effectiveDur: res.data.data.effectiveDur,
                        startTime: res.data.data.startTime
                    })
                    if(this.data.la2!=0 && this.data.lo2!=0){
                        this.distance(la1, lo1, this.data.la2, this.data.lo2);//计算经纬度
                    }else{
                        this.data.s=0
                    }
                    if(res.data.data.codeCategory!=1 || res.data.data.codeState==0){
                        if(res.data.data.codeState==0){
                            wx.showToast({
                                title: '二维码未启用',
                                icon: 'none',
                                duration: 2000
                            })
                        }
                        if(res.data.data.codeCategory==2){
                            wx.showToast({
                                title: '不支持门铃二维码',
                                icon: 'none',
                                duration: 2000
                            })
                        }
                        //延迟返回页面
                        setTimeout(
                            function () {
                                wx.redirectTo({
                                    url: '/pages/index/index',
                                })
                            }, 
                        2000)
                    }else{
                        //判断是否为永久二维码
                        if(res.data.data.codeType==1){
                            //如果是临时二维码则获取二维码临时时间
                            var timestamp = Date.parse(time.formatDate(this.data.startTime));//获取二维码的时间
                            var date = new Date(timestamp * 1000);
                            var days = this.data.effectiveDur;
                            console.log('创建二维码时间:'+date)
                            //二维码限定的天数
                            var before_timetamp = timestamp + days * 60 * 60;
                            //二维码限定的具体时间
                            var n_to = before_timetamp * 1000;
                            var before_timetamp = new Date(n_to);
                            console.log('二维码过期时间:'+before_timetamp)
                            //获取当天时间
                            var timestamps = Date.parse(new Date());
                            timestamps = timestamps / 1000;
                            var dates = new Date(timestamps * 1000);
                            console.log('当前时间:'+dates)
                            if(res.data.data.effectiveDur==0){
                                //判断目前距离是否大于二维码设置的距离
                                if(this.data.s>120 && this.data.la2!=0){
                                    wx.showToast({
                                        title: '距离不够，还差'+(this.data.s-120).toFixed()+'米',
                                        icon: 'none',
                                        duration: 2000
                                    })
                                    //延迟返回页面
                                    setTimeout(
                                        function () {
                                            wx.redirectTo({
                                                url: '/pages/index/index',
                                            })
                                        }, 
                                    2000)
                                }else{
                                    //距离合适
                                    this.get_weifengState()
                                }
                            }else{
                                //判断是否在时间内
                                if(dates<before_timetamp){
                                    console.log(this.data.s)
                                    //判断目前距离是否大于二维码设置的距离
                                    if(this.data.s>120 && this.data.la2!=0){
                                        wx.showToast({
                                            title: '距离不够，还差'+(this.data.s-120).toFixed()+'米',
                                            icon: 'none',
                                            duration: 2000
                                        })
                                        //延迟返回页面
                                        setTimeout(
                                            function () {
                                                wx.redirectTo({
                                                    url: '/pages/index/index',
                                                })
                                            }, 
                                        2000)
                                    }else{
                                        //距离合适
                                        this.get_weifengState()
                                    }
                                }else{
                                    wx.showToast({
                                        title: '二维码过期',
                                        icon: 'error',
                                        duration: 2000
                                    })
                                    //延迟返回页面
                                        setTimeout(
                                            function () {
                                                wx.redirectTo({
                                                    url: '/pages/index/index',
                                                })
                                            }, 
                                        2000)
                                }
                            }
                        }else{
                            //如果是永久二维码则直接判断距离
                                //判断目前距离是否大于二维码设置的距离
                                if(this.data.s>120 && this.data.la2!=0){
                                    console.log(this.data.s)
                                    wx.showToast({
                                        title: '距离不够，还差'+(this.data.s-120).toFixed()+'米',
                                        icon: 'none',
                                        duration: 2000
                                    })
                                    //延迟返回页面
                                    setTimeout(
                                        function () {
                                            wx.redirectTo({
                                                url: '/pages/index/index',
                                            })
                                        }, 
                                    2000)
                                }else{
                                    //距离合适
                                    this.get_weifengState()
                                }
                        }
                    }
                    
                }else{
                    //二维码提示错误
                    wx.showToast({
                        title: '请求错误',
                        icon: 'error',
                        duration: 2000
                    })
                    setTimeout(
                        function () {
                            wx.redirectTo({
                                url: '/pages/index/index',
                            })
                         }, 
                    2000)
                }
            },
            fail: err => {
                console.log(err)
            }
        })
    },
    // 获取沟通状态
    get_weifengState() {
        wx.request({
            url: url + 'app/common/v1/getUserMessageState',
            data: {
                codeId: wx.getStorageSync('weiFeng_userId'),
                openId: wx.getStorageSync('openid'),
                wechatCode: wx.getStorageSync('code'),
            },
            success: res => {
                if (res.statusCode === 200 && this.data.countDownNum === 60) {
                    //如果返回值为100则为正确的验证码
                    if (res.data.rescode == 100) {
                        this.get_weifengNum()
                        this.setData({
                            messageState: "挪车请求发送成功！"
                        })
                    } else {
                        //二维码失效
                        this.setData({
                            messageState: "挪车请求发送失败！"
                        })
                        //失效二维码提示信息
                        wx.showToast({
                            title: '二维码失效',
                            icon: 'error',
                            duration: 2000
                        })
                        //延迟返回页面
                        setTimeout(
                            function () {
                                wx.redirectTo({
                                    url: '/pages/index/index',
                                })
                             }, 
                        2000)
                    }
                }
            },
            fail: err => {
                console.log(err)
            }
        })
    },
    // 未读 5， 已读 1 2 3 0
    get_weifengNum() {
        wx.request({
            url: url + 'app/common/v1/getUserMessage',
            data: {
                codeId: wx.getStorageSync('weiFeng_userId'),
                openId: wx.getStorageSync('openid'),
                wechatCode: wx.getStorageSync('code'),
            },
            success: res => {
                if (res.data.data.messageStateNumber == '5') {
                    //如果初始时间为60则开启定时器
                    if (this.data.countDownNum == 60) {
                        this.countDown()
                    }
                    // 第一次请求
                    if (this.data.countDownNum != 0) {
                        this.setData({
                            loadIcon: "load.gif",
                            messageState: `请求${res.data.data.messageState}，请稍后，正在等待车主响应...`,
                        })
                        //每隔数秒之后重新调用接口 检查接口是否已读
                        setTimeout(() => {
                            this.get_weifengNum()
                        }, 6000);
                    }
                } else {
                    //已读 并返回相应信息
                    this.setData({
                        loadIcon: "success.png",
                        messageState: res.data.data.messageState,
                        goBack_btn: true,
                        messageStateNumber: res.data.data.messageStateNumber
                    })
                    wx.login({
                        success: res_login => {
                            const code = res_login.code
                            wx.setStorageSync('code', code)
                        }
                    })
                    return;
                }
            },
            fail: err => {
                console.log(err)
            }
        })
    },
    // 返回首页
    goBack_index: function () {
        wx.redirectTo({
            url: "/pages/index/index"
        })
    },

    // 重新申请挪车
    download: function () {
        wx.redirectTo({
            url: "/pages/result/result"
        })
    },

    //计算经纬度
    distance:function(la1, lo1, la2, lo2) {
        var La1 = la1 * Math.PI / 180.0;
        var La2 = la2 * Math.PI / 180.0;
        var La3 = La1 - La2;
        var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
        s = s * 6378.137;//地球半径
        s = Math.round(s * 10000) / 10000;
        s = s*1000
        // console.log("计算结果",s.toFixed());//toFixed()取整
        this.setData({
            s: s,
        })
        return s;
    },

    // 倒计时方法
    countDown: function () {
        let that = this;
        let countDownNum = that.data.countDownNum; //获取倒计时初始值
        //如果将定时器设置在外面，那么用户就看不到countDownNum的数值动态变化，所以要把定时器存进data里面
        that.setData({
            timer: setInterval(function () { //这里把setInterval赋值给变量名为timer的变量
                //每隔一秒countDownNum就减一，实现同步
                countDownNum--;
                //然后把countDownNum存进data，好让用户知道时间在倒计着
                that.setData({
                    countDownNum: countDownNum
                })
                // console.log('倒计时：', countDownNum)
                //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
                //如果计时器等于0或者接口数据不等于5将关闭定时器
                if (countDownNum == 0 || that.data.messageStateNumber != '5') {
                    //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
                    //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
                    clearInterval(that.data.timer);
                    //如果计时器等于0则让页面展示相应数据
                    if (countDownNum == 0) {
                        that.setData({
                            loadIcon: "error.png",
                            messageState: "车主没有响应，请尝试重新扫码！",
                            goBack_btn: true,
                        })
                    }
                    //关闭定时器之后，可作其他处理codes go here
                }
            }, 1000)
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {},

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