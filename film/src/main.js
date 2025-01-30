// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import cookies from "vue-cookies";
//配置字体图标
import "@/common/css/style.css";
Vue.config.productionTip = false;

Vue.use(cookies);

/* eslint-disable no-new */
// 创建vue实例，Vue应用的核心逻辑从这里开始
new Vue({
  el: "#app", //  指定Vue实例挂载的DOM元素。
  router, //  将路由实例注入到Vue实例中，使整个应用支持路由功能。
  components: { App }, //  注册根组件APP，从APP.vue里面导出的组件
  template: "<App/>" // 这个从哪里来的？？？？？
});

router.afterEach((to, from, next) => {
  window.scrollTo(0, 0);
});
