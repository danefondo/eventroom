import Vue from "vue";
import App from "./App.vue";
import VueI18n from "vue-i18n";
import i18nConfig from "./i18n/config";
import CKEditor from "@ckeditor/ckeditor5-vue";
import VueSocketIO from "vue-socket.io";
import VueRouter from "vue-router";
import Vuex from "vuex";
import VueCookies from "vue-cookies";
import VueYoutube from "vue-youtube";
import moment from "moment";
import VueHotkey from "v-hotkey";
import autolinker, { AUTOLINKER_NAME } from 'vue-autolinker'

import { setGlobals } from "./config/axios";
import router from "./router";
import store from "./store/index";

setGlobals();
Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(CKEditor);
Vue.use(VueYoutube);
Vue.use(VueCookies);
Vue.use(VueHotkey);

Vue.directive(AUTOLINKER_NAME, autolinker)



const i18n = new VueI18n(i18nConfig);

let connection =
  process.env.NODE_ENV === "production"
    ? window.location.host
    : "http://localhost:3000";

Vue.use(
  new VueSocketIO({
    connection,
  })
);

Vue.filter("formatDate", function(value) {
  if (!value) return "";
  return moment(value.toString()).format("MM/DD/YYYY hh:mm");
});

new Vue({
  i18n,
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
