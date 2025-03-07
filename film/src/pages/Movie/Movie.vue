<template>
  <div id="movie">
    <div class="tab-header">
      <span class="location">广州</span>
      <span
        :class="['normal', { active: isHotMovie }]"
        @click="optionMovieType(true, false)"
        >正在热映</span
      >
      <span
        :class="['normal', { active: !isHotMovie && !isRecommand }]"
        @click="optionMovieType(false, false)"
        >即将上映</span
      >
      <span
        :class="['normal', { active: !isHotMovie && isRecommand }]"
        @click="optionMovieType(false, true)"
        >猜你想看</span
      >

      <span class=" icon-search" @click="$router.push('search_movie')"></span>
    </div>
    <div class="tab-content" ref="container">
      <div class="panel" v-show="isHotMovie">
        <movie-item :movie-list="hotMovieList"></movie-item>
      </div>
      <div class="panel" v-show="!isHotMovie && !isRecommand">
        <movie-item :movie-list="notShowMovieList"></movie-item>
      </div>
      <div class="panel" v-show="!isHotMovie && isRecommand">
        <movie-item :movie-list="recommendedMovieList"></movie-item>
      </div>
    </div>
  </div>
</template>

<script>
import { getMovieList } from "../../api/index";
import { Indicator } from "mint-ui";
import Index from "element-ui/lib/utils/popup";
import MovieItem from "../../components/MovieItem/MovieItem";
import axios from 'axios';
export default {
  name: "Movie",
  components: {
    Index,
    MovieItem
  },
  created() {
    Indicator.open("Loading...");
    // 根据路由参数设置电影类型
    const hotMovieType = this.$route.query.hotMovie;
    if (hotMovieType == 0) {
      this.isHotMovie = false;
      this.isRecommand = false; // 即将上映
    } else if (hotMovieType == 2) {
      this.isHotMovie = false;
      this.isRecommand = true; // 猜你想看
    } else {
      this.isHotMovie = true; // 默认是正在热映
      this.isRecommand = false;
    }
    this.loadMovieList();
  },
  data() {
    return {
      //切换电影选项
      isHotMovie: true,
      isRecommand: false,
      //服务器地址
      server: "http://localhost:3000",
      //热门电影列表
      hotMovieList: [],
      //未上映电影列表
      notShowMovieList: [],
      //猜你想看电影列表
      recommendedMovieList: []
    };
  },
  methods: {
    async generateRecommendations() {
      console.log("开始进行推荐计算");
      try {
        const userId = this.$cookies.get("user_id");

        if (!userId) {
          // 未登录时展示默认推荐（热门电影）
          this.recommendedMovieList = this.hotMovieList.slice(0, 10);
          return;
        }
        // 合并 hotMovieList 和 notShowMovieList
        const candidateMovies = [...this.hotMovieList, ...this.notShowMovieList];
        console.log(candidateMovies);
        const res = await axios.post("/api/getRecommendedMovies", {
          userId,
          candidateMovies
        });
        console.log(res);

        if (res.data.success_code === 200) {
          this.recommendedMovieList = res.data.data;
          console.log("推荐成功");
        } else {
          // 推荐失败时展示默认推荐
          this.recommendedMovieList = this.hotMovieList.slice(0, 10);
          console.log("推荐失败时展示默认推荐");
        }
      } catch (error) {
        console.error("推荐失败:", error);
        this.recommendedMovieList = this.hotMovieList.slice(0, 10);
      }
    },
    //加载电影列表
    async loadMovieList() {
      let json = await getMovieList();
      json.data.forEach((value, index) => {
        const now = new Date("2023-01-01T00:00:00");
        if (now - new Date(value.public_date) >= 0) {
          this.hotMovieList.push(value);
        } else {
          this.notShowMovieList.push(value);
        }
      });
      this.hotMovieList.sort((a, b) => {
        return b.score - a.score;
      });
      this.notShowMovieList.sort((a, b) => {
        return b.wish_num - a.wish_num;
      });
      console.log("计算完了");
      Indicator.close();
      await this.generateRecommendations(); // 开始推荐计算
    },
    //改变电影类型
    optionMovieType(flag, isRecommend = false) {
      this.isHotMovie = flag;
      this.isRecommand = isRecommend;
      window.scroll(0, 0);
    }
  }
};
</script>

<style scoped lang="stylus" ref="stylesheet/stylus">
#movie
  width 100%
  height 100%
  .tab-header
    display flex
    justify-content space-around
    align-items center
    height 1rem
    width 100%
    font-size .3125rem
    background-color #dd2727
    color white
    position fixed
    left 0
    top 0
    .normal
      opacity .6
      position relative
      display flex
      justify-content center
      align-items center
      height 80%
      &.active
        color #fff
        border-bottom .06rem solid #fff
        opacity 1
    .icon-search
      font-size .48rem
  .tab-content
    margin-top 1rem
    font-size .3125rem
    padding 0 .3rem
    padding-bottom 1rem
    .panel
      width 100%
      .item
        display flex
        justify-content space-around
        align-items center
        padding .2rem 0
        border-bottom .03rem solid #f1f1f1
        img
          display inline-block
          width 20%
        .info
          width 68%
          display flex
          flex-flow column
          padding .25rem
          font-size .28rem
          color #9d9d9d
          .name
            font-weight 700
            font-size .345rem
            padding-bottom .2rem
            color #333
          .type
            padding-bottom .12rem
          .people
            padding-bottom .12rem
            .number
              color #ffb400
              font-family PingFangSC-Regular,Hiragino Sans GB,sans-serif
              font-weight 700
              font-size .315rem
          .score
            padding-bottom .12rem
            .number
              color #ffb400
              font-family PingFangSC-Regular,Hiragino Sans GB,sans-serif
              font-weight 700
              font-size .315rem
        .buy
          width 12%
          padding .16rem .12rem
          text-align center
          background-color #dd2727
          border-radius .08rem
          font-size .25rem
          color #fff
        .presell
          background-color #2d98f3
          width 12%
          padding .16rem .12rem
          text-align center
          border-radius .08rem
          font-size .25rem
          color #fff
</style>
