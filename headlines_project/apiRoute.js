const express = require("express");
const apiRoute = express.Router();
const apiController = require("./apiController.js");

//获取所有分类数据
apiRoute.get("/getCateGory",apiController.getCateGory);
//根据id获取分类数据信息
apiRoute.get("/getCateGoriesByCatId",apiController.getCateGoriesByCatId);
//根据文章id获取文章信息路由
apiRoute.get("/getPostById/:postId",apiController.getPostById);
//获取最新发布的文章数据路由
apiRoute.get("/latestRelease",apiController.latestRelease);
//首页文章点赞
apiRoute.get("/giveLike",apiController.giveLike);
module.exports = apiRoute;