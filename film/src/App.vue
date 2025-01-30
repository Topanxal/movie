<template>
  <!-- 根组件的模板部分 -->
  <div id="app">
    <!-- router-view 是 Vue Router 提供的组件，用于动态渲染当前路由匹配的组件 -->
    <router-view />

    <!-- tab-bar 是底部导航栏组件，根据当前路由的元信息决定是否显示 -->
    <tab-bar v-if="$route.meta.showTabBar" />
  </div>
</template>

<script>
// 导入底部导航栏组件
import TabBar from "./components/TabBar/TabBar";

// 导入 mint-ui 的全局样式文件
import "mint-ui/lib/style.css";

// 导出 App 组件的配置
export default {
  name: "App", // 组件名称，用于调试和递归组件
  components: { TabBar } // 注册 TabBar 组件，使其可以在模板中使用
};
</script>

<style scoped lang="stylus" ref="stylesheet/stylus">
/* 使用 scoped 属性确保样式只作用于当前组件 */
/* 使用 stylus 作为 CSS 预处理器 */
/* 该样式规则用于div id="app" ,用来撑满整个页面*/
#app {
  width: 100%;          /* 设置宽度为 100% */
  height: 100%;         /* 设置高度为 100% */
}
</style>
