module.exports = {
  devServer:{
    port: 8082, //本机端口号
    host: "localhost", //本机主机名
    https: false, //协议
    proxy: {
      '/api': {
        //目标服务器,代理访问到http://localhost:8080
        target: "http://localhost:8081",
        changOrigin: true, //开启代理
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
