// 获取最近一周 周一到周日 的日期信息
import store from '@/store';

export function getRecentWeekDates() {
  const today = new Date();
  const weekStart = new Date(today);

  weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

  const daysOfWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);

    const day = String(currentDate.getDate()).padStart(2, '0');

    weekDates.push({
      currentDate,
      day: daysOfWeek[i],
      date: `${day}`,
      numberDay: currentDate.getDay(),
    });
  }

  return weekDates;
}

export const toRouter = (url, params) => {
  params ? (url = url + '?' + params) : '';

  uni.navigateTo({
    url,
  });
};

export const toSwitch = (url) => {
  uni.switchTab({
    url,
  });
};

export const toReLaunch = (url, params) => {
  params ? (url = url + '?' + params) : '';

  uni.reLaunch({
    url,
  });
};

export const toBack = (delta = 1) => {
  uni.navigateBack(delta);
};

/**
 * 验证是否登录，未登录弹窗提示
 */
export function verifyIsLogin() {
  if (store.getters['app/isLogin']) {
    return true;
  }

  // toRouter('/packageLogin/pages/login/login');
  uni.showModal({
    title: '提示',
    content: '您当前未登录或登录已失效，为了您有更好的体验，慧食搭子需要您先进行登录',
    showCancel: true,
    success: (res) => {
      if (res.confirm) {
        toRouter('/packageLogin/pages/login/login');
      } else if (res.cancel) {
        console.log('用户点击取消');
      }
    },
  });

  throw Error('请先登录');
}

Date.prototype.format = function () {
  const year = this.getFullYear();
  const month = String(this.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(this.getDate()).padStart(2, '0');

  const hours = String(this.getHours()).padStart(2, '0');
  const minutes = String(this.getMinutes()).padStart(2, '0');
  const seconds = String(this.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

export function concatenateArrayBuffers(...buffers) {
  // 计算总长度
  let totalLength = 0;
  buffers.forEach((buffer) => {
    totalLength += buffer.byteLength;
  });

  // 创建一个新的ArrayBuffer，大小为总长度
  let resultBuffer = new Uint8Array(totalLength);

  // 累加器用于跟踪当前写入位置
  let currentOffset = 0;

  buffers.forEach((buffer) => {
    // 将每个buffer的数据复制到结果buffer的适当位置
    resultBuffer.set(new Uint8Array(buffer), currentOffset);
    currentOffset += buffer.byteLength;
  });

  // 返回合并后的ArrayBuffer
  return resultBuffer.buffer;
}

export function setStorageSyncWithExpire(key, data, expireInMinutes) {
  // 获取当前时间的时间戳（毫秒）
  const now = Date.now();
  // 计算过期时间的时间戳
  const expireTime = now + expireInMinutes * 60 * 1000;

  // 将数据和过期时间一起存储
  uni.setStorageSync(key, { data: data, expireTime: expireTime });
}

export function getStorageSyncWithExpire(key) {
  // 从本地缓存中同步获取指定 key 的内容
  const cache = uni.getStorageSync(key);

  if (!cache) {
    return null; // 如果没有找到对应key的数据，返回null
  }

  const now = Date.now();

  // 检查是否已过期
  if (cache.expireTime < now) {
    // 数据已过期，可以在这里进行清理等操作
    console.log('缓存已过期');
    uni.removeStorageSync(key); // 移除过期数据
    return null;
  } else {
    // 数据未过期，返回数据
    return cache.data;
  }
}
