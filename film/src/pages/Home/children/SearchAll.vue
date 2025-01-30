<template>
  <div class="search-all">
    <div class="header">
      <div class="search">
        <span
          class="icon-dropdown-arrow"
          :class="{ 'arrow-open': isDropdownOpen }"
          @click="toggleDropdown"
          >&#9660;</span
        >
        <span class="icon-search"></span>
        <!-- 绑定 placeholder 到计算属性 -->
        <input type="text" :placeholder="getPlaceholder" v-model.trim="name" />
      </div>
      <div class="dropdown-menu" v-if="isDropdownOpen">
        <div class="dropdown-item">
          <input
            type="checkbox"
            id="search-movie"
            v-model="searchOptions.movie"
          />
          <label for="search-movie">搜电影</label>
        </div>
        <div class="dropdown-item">
          <input
            type="checkbox"
            id="search-cinema"
            v-model="searchOptions.cinema"
          />
          <label for="search-cinema">搜影院</label>
        </div>
        <div class="dropdown-item">
          <input
            type="checkbox"
            id="fuzzy-search"
            v-model="searchOptions.fuzzy"
          />
          <label for="fuzzy-search">模糊搜索</label>
        </div>
      </div>
      <span class="cancel-btn" @click="$router.go(-1)">取消</span>
    </div>
    <div class="content">
      <!-- 原有内容 -->
      <div class="movie-container" v-if="movieInfo.length">
        <div class="title">影片</div>
        <movie-item :movie-list="movieInfo" :search-name="name"></movie-item>
      </div>
      <div class="cinema-container" v-if="cinemaInfo.length">
        <div class="title">影院</div>
        <div
          class="item"
          v-for="(item, index) in cinemaInfo"
          :key="index"
          @click="
            $router.push({
              path: '/cinema_detail',
              query: { cinema_id: item.cinema_id }
            })
          "
        >
          <div class="left">
            <div
              class="name ellipsis"
              v-html="ruleName(item.cinema_name)"
            ></div>
            <div class="address ellipsis">{{ item.specified_address }}</div>
            <div class="label-block">
              <span>小吃</span><span>4D厅</span><span>杜比全景声厅</span
              ><span>巨幕厅</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tips" v-if="name && !movieInfo.length && !cinemaInfo.length">
        <span class="icon icon-empty-content"></span>
        <span class="text">暂时木有内容呀</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  matchCinemaByName,
  matchMovieByName,
  semanticSearchMovie
} from "../../../api/index";
import MovieItem from "../../../components/MovieItem/MovieItem";

export default {
  name: "SearchAll",
  components: {
    MovieItem
  },
  data() {
    return {
      name: "",
      movieInfo: [],
      cinemaInfo: [],
      server: "http://localhost:3000",
      timer: "",
      isDropdownOpen: false, // 控制下拉菜单是否显示
      searchOptions: {
        movie: true, // 搜电影初始勾选
        cinema: true, // 搜影院初始勾选
        fuzzy: false // 模糊搜索初始不勾选
      }
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
        clearTimeout(this.timer); // 下拉菜单展开时停止搜索
      }
    },
    closeDropdown() {
      this.isDropdownOpen = false;
    },
    handleClickOutside(event) {
      const dropdown = this.$el.querySelector(".dropdown-menu");
      const arrow = this.$el.querySelector(".icon-dropdown-arrow");
      if (
        dropdown &&
        !dropdown.contains(event.target) &&
        !arrow.contains(event.target)
      ) {
        this.closeDropdown();
      }
    },
    // 合并精准搜索和模糊搜索的结果
    async filterData() {
      if (this.isDropdownOpen) return; // 下拉菜单展开时不进行搜索
      const keyword = this.name;
      this.movieInfo = [];
      this.cinemaInfo = [];

      // 精准搜索
      if (this.searchOptions.movie && !this.searchOptions.fuzzy) {
        let exactMovieResults = await matchMovieByName(keyword);
        if (exactMovieResults.success_code === 200) {
          this.movieInfo = exactMovieResults.data;
        }
      }

      // 模糊搜索
      if (this.searchOptions.fuzzy && this.searchOptions.movie) {
        // 1️⃣ 获取精准搜索的结果并去重（不改变顺序）
        let exactMovieResults = await matchMovieByName(keyword);
        let exactMovieIds = new Set(); // 记录 movie_id，避免重复
        let exactMovies = [];

        for (const movie of exactMovieResults.data) {
          if (!exactMovieIds.has(movie.movie_id)) {
            exactMovieIds.add(movie.movie_id);
            exactMovies.push(movie);
          }
        }
        console.log("去重后的精准搜索结果:", exactMovies);

        // 2️⃣ 获取模糊搜索的结果并去重（不改变顺序）
        let fuzzyMovieResults = await semanticSearchMovie(keyword);
        let fuzzyMovieIds = new Set();
        let fuzzyMovies = [];

        if (fuzzyMovieResults.success_code === 200) {
          for (const movie of fuzzyMovieResults.data) {
            if (!fuzzyMovieIds.has(movie.movie_id)) {
              fuzzyMovieIds.add(movie.movie_id);
              fuzzyMovies.push(movie);
            }
          }
        }
        console.log("去重后的模糊搜索结果:", fuzzyMovies);

        // 3️⃣ 过滤掉模糊搜索中与精准搜索重复的电影
        const uniqueFuzzyResults = fuzzyMovies.filter(
          movie => !exactMovieIds.has(movie.movie_id)
        );
        console.log("过滤后最终的模糊搜索结果:", uniqueFuzzyResults);

        // 4️⃣ 合并模糊搜索结果到精准搜索结果后面
        this.movieInfo = [...exactMovies, ...uniqueFuzzyResults];

        console.log("最终的搜索结果:", this.movieInfo);
      }

      // 搜影院逻辑（保持不变）
      if (this.searchOptions.cinema) {
        let json = await matchCinemaByName(keyword);
        if (json.success_code === 200) {
          this.cinemaInfo = json.data;
        }
      }
    }
  },
  watch: {
    async name(newVal, oldVal) {
      clearTimeout(this.timer);
      if (newVal) {
        this.timer = setTimeout(async () => {
          await this.filterData();
        }, 500);
      }
    },
    searchOptions: {
      deep: true,
      handler() {
        this.filterData();
      }
    }
  },
  computed: {
    ruleName() {
      return nameString => {
        let replaceReg = new RegExp(this.name, "g");
        let replaceString = `<span style="color: #dd2727">${this.name}</span>`;
        return nameString.replace(replaceReg, replaceString);
      };
    },
    // 新增计算属性 getPlaceholder
    getPlaceholder() {
      let searchType = this.searchOptions.fuzzy ? "【模糊】" : "【精确】";
      let searchTarget = "1";
      if (this.searchOptions.movie && this.searchOptions.cinema) {
        searchTarget = "影片、影院";
      } else if (this.searchOptions.movie) {
        searchTarget = "影片";
      } else if (this.searchOptions.cinema) {
        searchTarget = "影院";
      }
      return `${searchType}搜${searchTarget}`;
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  }
};
</script>

<style scoped lang="stylus" ref="stylesheet/stylus">
.search-all
  width 100%
  background-color #f5f5f5
  .header
    width 100%
    height 1rem
    display flex
    justify-content center
    align-items center
    background-color #fff
    box-shadow 0 0 .002rem #888
    .search
      flex 4
      display flex
      align-items center
      border-radius .5rem
      margin-left .25rem
      padding .125rem .25rem
      background-color #f5f5f5
      .icon-dropdown-arrow
        font-size .375rem
        margin-right .1rem
        color blue // 初始蓝色
        cursor pointer
      .arrow-open
        color black // 下拉后黑色
      .icon-search
        font-size .375rem
      input
        width 100%
        border none
        outline none
        background-color #f5f5f5
        caret-color #dd2727
        text-indent .125rem
        font-size .3rem !important
    .dropdown-menu
      position absolute
      top 1rem
      left .25rem
      background-color white
      border 1px solid #ccc
      border-radius .1rem
      padding .1rem
      box-shadow 0 2px 4px rgba(0, 0, 0, 0.1)
      .dropdown-item
        display flex
        align-items center
        margin-bottom .05rem
        input[type="checkbox"]
          width: .3rem  // 增大勾选框大小
          height: .3rem
        label
          font-size: .25rem  // 减小字体大小
          margin-left: .15rem  // 增加文字与勾选框的间距
    .cancel-btn
      flex 1
      font-size .3rem
      color #dd2727
      text-align center
  .content
    width 100%
    background #fff
    .movie-container
      width 100%
      font-size .3125rem
      padding .3rem
      box-sizing border-box
      border-top .04rem solid #f1f1f1
      .title
        font-size .3rem
        padding-bottom .25rem
        border-bottom .03rem solid #f1f1f1
      .item
        display flex
        justify-content space-around
        align-items center
        padding .25rem
        border-bottom .03rem solid #f1f1f1
        img
          display inline-block
          width 20%
          border-radius .1rem
        .info
          width 68%
          display flex
          flex-flow column
          padding .25rem
          font-size .25rem
          color #9d9d9d
          .name
            font-weight bolder
            padding-bottom .2rem
            color #333
          .type
            padding-bottom .2rem
          .people
            padding-bottom .2rem
            .number
              color #ffb400
          .score
            padding-bottom .2rem
            .number
              color #ffb400
        .buy
          width 12%
          padding .16rem .12rem
          text-align center
          background-color #dd2727
          border-radius 24%
          font-size .25rem
          color #fff
        .presell
          background-color #2d98f3
          width 12%
          padding .16rem .12rem
          text-align center
          border-radius 20%
          font-size .25rem
          color #fff
    .cinema-container
      width 100%
      font-size .3125rem
      padding .3rem
      box-sizing border-box
      border-top .04rem solid #f1f1f1
      .title
        font-size .3rem
        padding-bottom .25rem
        border-bottom .03rem solid #f1f1f1
      .item
        display flex
        justify-content center
        align-items center
        box-sizing border-box
        padding .25rem
        width 100%
        border-bottom .03rem solid #f1f1f1
        margin-bottom .25rem
        .left
          width 100%
          .name
            font-size .345rem
            line-height .36rem
            margin-bottom .25rem
            font-weight 700
          .address
            font-size .28rem
            line-height .3rem
            color #666
            margin-bottom .25rem
          .label-block
            display flex
            span
              padding .06rem
              font-size .2rem
              border .01rem solid #f90
              margin-right .1rem
              border-radius .04rem
              color #f90
        .right
          width 20%
          text-align center
          .price-block
            color #dd2727
            .price
              font-size .38rem
    .tips
      display flex
      justify-content center
      align-items center
      flex-flow column
      font-size .28rem
      padding-top 4rem
      border-top .04rem solid #f1f1f1
      .icon
        font-size 1.6rem
        margin-bottom .25rem
      .text
        color #ccc
</style>
