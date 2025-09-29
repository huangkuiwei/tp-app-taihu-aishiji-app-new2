// import { toRouter } from '@/utils/index';

import store from '@/store';

let baseApi = '/';

if (process.env.VUE_APP_PLATFORM === 'h5') {
  baseApi = process.env.VUE_APP_REQUEST_PROXY_BASE_API_URL;
} else {
  baseApi = process.env.VUE_APP_REQUEST_BASE_API_URL;
}

let hasShowLoginModal = false;

const $http = {
  post: (url, data, config = {}) => {
    let token = config.token || uni.getStorageSync('foodDiaryToken').value;

    if (!url.includes('http')) {
      url = baseApi + url;
    }

    return new Promise((resolve, reject) => {
      uni.request({
        method: 'POST',
        withCredentials: true,
        url: url,
        data,
        dataType: 'json',
        header: {
          token,
          ...(config.headers || {}),
        },
        ...config,
        success: (res) => {
          if (url.includes('api/baseai/agent-chat')) {
            resolve(res);
            return;
          }

          if (config.responseType === 'blob') {
            resolve(res);
            return;
          }

          if (res.data.code === 0 || res.data.Code === 0) {
            resolve(res.data);
          } else {
            uni.hideLoading();

            if (res.data.Code !== -100) {
              if (!config.hiddenErrorMessage) {
                uni.showToast({
                  title: res.data.msg || res.data.Msg,
                  icon: 'none',
                  mask: true,
                });
              }

              reject(res.data);
            } else {
              if (url.includes('tool.laketay.com')) {
                // 清除过期 token
                uni.removeStorageSync('foodDiaryToken');
                store.commit('app/_setUserInfo', {});
              }

              if (!hasShowLoginModal && !config.hideLoginBox) {
                hasShowLoginModal = true;

                // uni.showModal({
                //   title: '提示',
                //   content: '您当前未登录或登录已失效，为了您有更好的体验，慧食搭子需要您进行授权登录',
                //   showCancel: true,
                //   success: (res) => {
                //     hasShowLoginModal = false;
                //
                //     if (res.confirm) {
                //       toRouter('/packageLogin/pages/login/login');
                //     } else if (res.cancel) {
                //       console.log('用户点击取消');
                //     }
                //   },
                // });
              }

              reject(res.data);
            }
          }
        },
        fail: (error) => {
          if (!config.hiddenErrorMessage) {
            if (error.errMsg === 'request:fail timeout') {
              error.errMsg = '接口超时，请稍后重试';
            }

            uni.showToast({
              title: error.errMsg || '接口异常',
              icon: 'none',
              mask: true,
            });
          }

          reject();
        },
      });
    });
  },

  get: (url, data, config = {}) => {
    let token = config.token || uni.getStorageSync('foodDiaryToken').value;

    if (!url.includes('http')) {
      url = baseApi + url;
    }

    return new Promise((resolve, reject) => {
      uni.request({
        method: 'GET',
        withCredentials: true,
        url: url,
        data,
        dataType: 'json',
        header: {
          token,
          ...(config.headers || {}),
        },
        ...config,
        success: (res) => {
          if (config.responseType === 'blob') {
            resolve(res);
            return;
          }

          if (res.data.code === 0 || res.data.Code === 0) {
            resolve(res.data);
          } else {
            uni.hideLoading();

            if (res.data.Code !== -100) {
              if (!config.hiddenErrorMessage) {
                uni.showToast({
                  title: res.data.msg || res.data.Msg,
                  icon: 'none',
                  mask: true,
                });
              }

              reject(res.data);
            } else {
              if (url.includes('tool.laketay.com')) {
                // 清除过期 token
                uni.removeStorageSync('foodDiaryToken');
                store.commit('app/_setUserInfo', {});
              }

              if (!hasShowLoginModal && !config.hideLoginBox) {
                hasShowLoginModal = true;

                // uni.showModal({
                //   title: '提示',
                //   content: '您当前未登录或登录已失效，为了您有更好的体验，慧食搭子需要您进行授权登录',
                //   showCancel: true,
                //   success: (res) => {
                //     hasShowLoginModal = false;
                //
                //     if (res.confirm) {
                //       toRouter('/packageLogin/pages/login/login');
                //     } else if (res.cancel) {
                //       console.log('用户点击取消');
                //     }
                //   },
                // });
              }

              reject(res.data);
            }
          }
        },
        fail: (error) => {
          if (!config.hiddenErrorMessage) {
            if (error.errMsg === 'request:fail timeout') {
              error.errMsg = '接口超时，请稍后重试';
            }

            uni.showToast({
              title: error.errMsg || '接口异常',
              icon: 'none',
              mask: true,
            });
          }

          reject();
        },
      });
    });
  },

  upload: (url, fileUrl, name = 'file', formData = {}, config = {}) => {
    let token = config.token || uni.getStorageSync('foodDiaryToken').value;

    if (!url.includes('http')) {
      url = baseApi + url;
    }

    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: url,
        name: name,
        filePath: fileUrl,
        formData: formData,
        header: {
          token,
          ...(config.headers || {}),
        },
        ...config,
        success: (res) => {
          res.data = JSON.parse(res.data);

          if (res.data.code === 0 || res.data.Code === 0) {
            resolve(res.data);
          } else {
            uni.hideLoading();

            if (res.data.Code !== -100) {
              if (!config.hiddenErrorMessage) {
                uni.showToast({
                  title: res.data.msg || res.data.Msg,
                  icon: 'none',
                  mask: true,
                });
              }

              reject(res.data);
            } else {
              if (url.includes('tool.laketay.com')) {
                // 清除过期 token
                uni.removeStorageSync('foodDiaryToken');
                store.commit('app/_setUserInfo', {});
              }

              if (!hasShowLoginModal && !config.hideLoginBox) {
                hasShowLoginModal = true;

                // uni.showModal({
                //   title: '提示',
                //   content: '您当前未登录或登录已失效，为了您有更好的体验，慧食搭子需要您进行授权登录',
                //   showCancel: true,
                //   success: (res) => {
                //     hasShowLoginModal = false;
                //
                //     if (res.confirm) {
                //       toRouter('/packageLogin/pages/login/login');
                //     } else if (res.cancel) {
                //       console.log('用户点击取消');
                //     }
                //   },
                // });
              }

              reject(res.data);
            }
          }
        },
        fail: (error) => {
          if (!config.hiddenErrorMessage) {
            if (error.errMsg === 'request:fail timeout') {
              error.errMsg = '接口超时，请稍后重试';
            }

            uni.showToast({
              title: error.errMsg || '接口异常',
              icon: 'none',
              mask: true,
            });
          }

          reject();
        },
      });
    });
  },
};

export default $http;
