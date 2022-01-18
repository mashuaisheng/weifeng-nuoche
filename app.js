// app.js
var AppId = 'wx603a05a28ba9fa0f';
var AppSecret = '3d378200e11680900823f8d0c9cb2e03';
var url ='https://viefong.com:8443/';
App({
  onLaunch() {
    this.get_openId()
  },
  // 获取用户openId
  get_openId:function() {
    wx.login({
      success: res_login => {
        const code =res_login.code
        // console.log('code值='+code),
        wx.request({
          url: url+'app/common/v1/getVXAppId',
          data:{
            appId: AppId,
            appsecret: AppSecret,
            code: code
          },
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          }, 
          method: 'POST', 
          success: res => {
            if (res.data.data.openid) {
              wx.setStorageSync('openid', res.data.data.openid)
              wx.setStorageSync('code', code)
            } else {
              wx.showToast({
                title: '未获取到您的信息',
                icon: 'none',
                duration: 3000
              })  
            }
          },
          fail: err => {
            // wx.showModal({
            //   title: '提示',
            //   showCancel: false,
            //   content: '可能网络不太好，请重试！',
            //   success: function () {
            //     wx.navigateTo({
            //       url: '/pages/download/download'
            //     });
            //   }
            // });
            // console.log(err)
          }
        })
      }
    })
  },
  //设置全局变量
  globalData: {
    userInfo: null,
    openid:'',
  }
})
