import Vue from 'vue';
import App from './App';
import './uni.promisify.adaptor';
import store from './store';
import { toBack, toReLaunch, toRouter, toSwitch } from '@/utils';
const towxml = require('./wxcomponents/towxml/index');

import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import uniPopupDialog from '@dcloudio/uni-ui/lib/uni-popup-dialog/uni-popup-dialog.vue';
import uniPopupMessage from '@dcloudio/uni-ui/lib/uni-popup-message/uni-popup-message.vue';
import uniPopupShare from '@dcloudio/uni-ui/lib/uni-popup-share/uni-popup-share.vue';
import uniTransition from '@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue';
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
import uniFilePicker from '@dcloudio/uni-ui/lib/uni-file-picker/uni-file-picker.vue';

Vue.config.productionTip = false;

Vue.component('uniIcons', uniIcons);
Vue.component('uniPopupDialog', uniPopupDialog);
Vue.component('uniPopupMessage', uniPopupMessage);
Vue.component('uniPopupShare', uniPopupShare);
Vue.component('uniTransition', uniTransition);
Vue.component('uniPopup', uniPopup);
Vue.component('uniFilePicker', uniFilePicker);

Vue.prototype.$toRouter = toRouter;
Vue.prototype.$toSwitch = toSwitch;
Vue.prototype.$toBack = toBack;
Vue.prototype.$toReLaunch = toReLaunch;

Vue.prototype.$towxml = towxml;

App.mpType = 'app';

const app = new Vue({
  ...App,
  store,
});
app.$mount();
