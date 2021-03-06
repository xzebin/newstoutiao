const express = require("express");
const controller = require("./controller.js");
let multer = require("multer");

let upload = multer({
    dest:"./public/upload/"
})
//定义路由对象
const route = express.Router();

//获取后台首页页面路由
route.get("/index",controller.getIndex);
//获取登录页面路由
route.get("/login",controller.getLogin);
//文章列表获取分页数据路由
route.get("/getPosts",controller.getPosts);
//获取文章列表页面路由
route.get("/getPostLis",controller.getPostLis);
//登录验证路由
route.post("/checkLogin",controller.checkLogin);
//获取文章总页
route.get("/getTotalPage",controller.getTotalPage);
//跳转评论页面路由
route.get("/getCommentsLis",controller.getCommentsLis);
//跳转写文章页面路由
route.get("/getAddPost",controller.getAddPost);
//删除文章路由
route.get("/delPost",controller.delPost);
//获取评论总页
route.get("/getCommentsTotalPage",controller.getCommentsTotalPage);
//获取对应页码的数据
route.get("/getComments",controller.getComments);
//添加文章的图片上传
route.post("/uploadImg",upload.single("imgFile"),controller.uploadImg);
//添加文章
route.post("/savePost",controller.savePost);
//退出登录路由
route.get("/loginOut",controller.loginOut);
//根据邮箱获取头像路由
route.get("/getImgByEamil",controller.getImgByEamil);
//渲染修改文章路由
route.get("/getEditPost",controller.getEditPost);
//编辑文章路由
route.post("/editPost",controller.editPost);
//渲染用户列表页面路由
route.get("/getUserLists",controller.getUserLists);
//渲染个人信息路由
route.get("/getProFile",controller.getProFile);
//渲染修改个人信息的密码页面
route.get("/getPwdReset",controller.getPwdReset);
//校验旧密码是否正确路由
route.get("/checkPwd",controller.checkPwd);
//获取session信息路由
route.get("/getSessionInfo",controller.getSessionInfo);
//修改密码路由
route.post("/updatePwd",controller.updatePwd);
//修改用户信息路由
route.post("/updateCurrentUserInfo",controller.updateCurrentUserInfo);
//获取用户总页码数
route.get("/getUsersTotalPage",controller.getUsersTotalPage);
//获取对应页码的用户数据
route.get("/getUserLists",controller.getUserLists);
//渲染用户页面路由
route.get("/getUsers",controller.getUsers);
//添加用户路由
route.post("/addUser",controller.addUser);
//渲染用户列表需要修改的用户信息路由
route.get("/editUserInfo",controller.editUserInfo);
//修改用户信息路由
route.post("/editUser",controller.editUser);
//删除用户路由
route.get("/deleteUser/:userId",controller.deleteUser);
//获取分类目录页面路由
route.get("/splitCatalog",controller.splitCatalog);
//获取分页目录总页码数
route.get("/getCateGoriesTotalPage",controller.getCateGoriesTotalPage);
//获取分页目录对应页码的数据
route.get("/getCategoriesLists",controller.getCategoriesLists);
//添加分类路由
route.post("/addCateGories",controller.addCateGories);
//删除分类路由
route.get("/delCateGories/:catId",controller.delCateGories);
//渲染编辑分类页面
route.get("/editCateGoritesHtml",controller.editCateGoritesHtml);
//编辑分类信息
route.post("/editCateGories",controller.editCateGories);
//删除评论路由
route.get("/delComment",controller.delComment);
//批准评论路由
route.get("/approvalComment",controller.approvalComment);
//渲染图片轮播路由
route.get("/getSlidesHtml",controller.getSlidesHtml);
//获取轮播图数据
route.get("/getSwipes",controller.getSwipes);
//将路由器暴露出去
module.exports = route;