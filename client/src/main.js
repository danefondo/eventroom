import Vue from "vue";
import App from "./App.vue";
import VueI18n from 'vue-i18n';
import i18nConfig from './i18n/config';
import CKEditor from "@ckeditor/ckeditor5-vue";
import VueSocketIO from "vue-socket.io";
import VueRouter from "vue-router";
import VueCookies from 'vue-cookies';
import { setGlobals } from "./config/axios";
import router from "./router";

setGlobals();
Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(VueRouter);
Vue.use(CKEditor);
Vue.use(VueCookies);

const i18n = new VueI18n(i18nConfig);

let connection = process.env.NODE_ENV === "production" ? window.location.host : "http://localhost:3000";

Vue.use(
  new VueSocketIO({
    connection,
  })
);

new Vue({
  i18n,
  router,
  render: (h) => h(App),
}).$mount("#app");
