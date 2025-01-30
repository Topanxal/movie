// 导入所需的核心模块
var createError = require('http-errors')          // 用于创建 HTTP 错误对象
var express = require('express')                  // Express 框架核心
var path = require('path')                        // Node.js 路径处理模块
var cookieParser = require('cookie-parser')       // Cookie 解析中间件
var logger = require('morgan')                    // HTTP 请求日志记录器
var session = require('express-session')          // Session 会话中间件

// 导入路由模块
var indexRouter = require('./routes/index')       // 导入主路由文件

// 创建 Express 应用实例
var app = express()

// 配置视图引擎
app.set('views', path.join(__dirname, 'views'))  // 设置视图文件目录
app.set('view engine', 'ejs')                    // 设置视图引擎为 EJS

// 配置静态文件服务
app.use(express.static('public'))                // 设置静态文件目录

// 配置 Session 中间件
app.use(
  session({
    secret: 'keyboard cat',                      // 用于签名 session ID cookie 的密钥
    resave: false,                               // 强制保存 session 即使它并没有变化
    saveUninitialized: true,                     // 强制将未初始化的 session 存储
    cookie: { maxAge: 1000 * 60 * 60 * 24 },    // 设置 cookie 过期时间为 24 小时
  }),
)

// 配置中间件
app.use(logger('dev'))                          // 启用开发环境下的日志记录
app.use(express.json())                         // 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: false })) // 解析 URL 编码的请求体
app.use(cookieParser())                         // 解析 Cookie
app.use(express.static(path.join(__dirname, 'public'))) // 设置静态文件目录

// 注册路由
app.use('/', indexRouter)                       // 使用主路由

// 配置 CORS (跨域资源共享)
app.all('*', function (req, res, next) {
  if (!req.get('Origin')) return next()         // 如果没有 Origin 头，继续下一个中间件
  res.set('Access-Control-Allow-Origin', '*')   // 允许所有来源的跨域请求
  res.set('Access-Control-Allow-Methods', 'GET') // 允许的 HTTP 方法
  res.set(
    'Access-Control-Allow-Headers',             // 允许的请求头
    'X-Requested-With,Origin,Content-Type,Accept',
  )
  // res.set('Access-Control-Allow-Max-Age', 3600); // 预检请求的有效期（已注释）
  if ('OPTIONS' === req.method) return res.sendStatus(200) // 处理预检请求
  next()
})

// 404 错误处理中间件
app.use(function (req, res, next) {
  next(createError(404))                        // 创建 404 错误并传递给错误处理中间件
})

// 错误处理中间件
app.use(function (err, req, res, next) {
  // 设置本地变量，仅在开发环境提供错误信息
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // 渲染错误页面
  res.status(err.status || 500)                // 设置 HTTP 状态码
  res.render('error')                          // 渲染错误页面
})

// 启动服务器，监听 3000 端口
app.listen(3000)

// 导出 app 实例
module.exports = app
