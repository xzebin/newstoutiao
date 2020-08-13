const express = require("express");
const app = express();
const route = require("./route.js");
const artTemplate = require('art-template'); 
const express_template = require('express-art-template');
const expressSession = require('express-session');
const apiRoute = require("./apiRoute.js");
const cors = require("cors");

app.use(expressSession({

    name:'SESSIONID',  // session会话名称在cookie中的值

    secret:'!@#mingde#@!', // 必填项，用户session会话加密（防止用户篡改cookie），自定义，尽量多为特殊字符

    cookie:{  //设置session在cookie中的其他选项配置

      path:'/',

      secure:false,  //默认为false, true 只针对于域名https协议

      maxAge:6000000,  

    }

}));

app.use(cors());

//配置模板的路径
app.set('views', __dirname + '/views/admin/');
//设置express_template模板后缀为.html的文件(不设这句话，模板文件的后缀默认是.art)
app.engine('html', express_template); 
//设置视图引擎为上面的html
app.set('view engine', 'html');

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

let urlArr = ["/login","/loginOut","/checkLogin","/getImgByEamil"];


//托管静态资源文件
app.use("/public",express.static(__dirname + "/public/"));

//前端页面发送的请求不需要通过session的权限验证，所有要放在前面
app.use("/api",apiRoute);


app.use((req,res,next)=>{
  if(urlArr.includes(req.path)){
      next();
  }else{
      if(req.session.currentUser){
          next();
      }else{
          res.render("login.html"); 
      }
  }
});

//将路由器挂载到中间件中
app.use(route);

//监听服务
app.listen(8888,()=>{
    console.log("8888成功启动......");
});