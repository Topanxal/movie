import Vue from "vue";
import Router from "vue-router";

// 这里使用了懒加载，只有访问/log页面的时候，才会引入Login组件
const Login = () => import("../components/Login/Login");

import Home from "../pages/Home/Home";
import SearchAll from "../pages/Home/children/SearchAll";
import Movie from "../pages/Movie/Movie";
import SearchMovie from "../pages/Movie/children/SearchMovie";
import MovieDetail from "../components/MovieDetail/MovieDetail";
import CommentPanel from "../components/MovieDetail/children/CommentPanel";
import Cinema from "../pages/Cinema/Cinema";
import CinemaDetail from "../components/CinemaDetail/CinemaDetail";
import SearchCinema from "../pages/Cinema/children/SearchCinema";
import SelectCinema from "../components/SelectCinema/SelectCinema";
import SelectSeat from "../components/SelectSeat/SelectSeat";
import SubmitOrder from "../components/SubmitOrder/SubmitOrder";
import Pay from "../components/Pay/Pay";
import My from "../pages/My/My";
import MyInfo from "../pages/My/children/MyInfo";
import MyOrder from "../pages/My/children/MyOrder";
import MyMovie from "../pages/My/children/MyMovie";
import ModifyUserName from "../pages/My/children/ModifyUserName";
import ModifyUserSign from "../pages/My/children/ModifyUserSign";

// 安装 Vue Router 插件，使 Vue 组件可以使用 $router 和 $route 访问路由信息。
Vue.use(Router);

export default new Router({
  // 配置路由，每个对象代表一个页面路由
  routes: [
    {
      path: "/",
      redirect: "/home"
    },
    // 这是主要页面路由，代表四个页面，所以下面也展示了tabBar，控制显示导航栏
    {
      path: "/home",
      name: "home",
      component: Home,
      meta: {
        showTabBar: true
      }
    },
    {
      path: "/movie",
      name: "movie",
      component: Movie,
      meta: { showTabBar: true }
    },
    {
      path: "/cinema",
      name: "cinema",
      component: Cinema,
      meta: { showTabBar: true }
    },
    {
      path: "/my",
      name: "my",
      component: My,
      meta: { showTabBar: true }
    },
    // 个人中心的子页面，不需要底部导航栏，一般通过‘my’进入
    {
      path: "/my_info",
      name: "my_info",
      component: MyInfo
    },
    {
      path: "/my_order",
      name: "my_order",
      component: MyOrder
    },
    {
      path: "/my_movie",
      name: "my_movie",
      component: MyMovie
    },
    {
      path: "/modify_username",
      name: "modify_username",
      component: ModifyUserName
    },
    {
      path: "/modify_usersign",
      name: "modify_usersign",
      component: ModifyUserSign
    },
    // 电影相关页面，用于全局搜索和电影搜索
    {
      path: "/search_all",
      component: SearchAll
    },
    {
      path: "/search_movie",
      component: SearchMovie
    },
    {
      path: "/movie_detail",
      name: "movie_detail",
      component: MovieDetail
    },
    // 影院相关页面
    {
      path: "/cinema_detail",
      component: CinemaDetail
    },
    {
      path: "/select_cinema",
      component: SelectCinema
    },
    // 购票流程
    {
      path: "/select_seat",
      component: SelectSeat
    },
    {
      path: "/comment_panel",
      component: CommentPanel
    },
    {
      path: "/search_cinema",
      component: SearchCinema
    },
    {
      path: "/submit_order",
      component: SubmitOrder
    },
    {
      path: "/pay",
      component: Pay
    },
    // 登陆页面
    {
      path: "/login",
      component: Login
    }
  ]
});
