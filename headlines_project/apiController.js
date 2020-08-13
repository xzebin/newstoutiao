const mysql = require("mysql");
const queryInfo = require("./model.js");
const moment = require("moment");

let apiController = {};

apiController.getCateGory = async (req,res)=>{
    let sql = "select * from category";
    let data = await queryInfo(sql);
    res.json(data);
}

apiController.getCateGoriesByCatId = async (req,res)=>{
    let catId = req.query.currentCatId;
    let currentPage = req.query.currentPage;
    currentPage = parseInt((currentPage-1)*5);
    let sql = `select p.*,c.cat_name,u.nickname from posts p,category c,users u where p.cat_id = c.cat_id and u.user_id = p.user_id and p.cat_id = ${catId} limit ${currentPage},5`;
    let data = await queryInfo(sql);
    data.forEach(element => {
        element.created = moment(element.created).format("YYYY-MM-DD HH:mm:ss");
        if(element.feature.indexOf("dummy") < 0){
            element.feature = "http://127.0.0.1:8888" + element.feature;
        }
    });
    let newDataArr = [];
    for(var i = 0;i < data.length; i++){
        let obj = {};
        let sql = `select count(c.comment_id) as commentNum from posts p,comments c where p.post_id = c.post_id and p.post_id = ${data[i].post_id}`;
        let result = await queryInfo(sql);
        Object.assign(obj,data[i]);
        obj.commentNum = result[0].commentNum;
        newDataArr.push(obj);
    }
    res.json(newDataArr);
}

apiController.getPostById = async (req,res)=>{
    let postId = req.params.postId;
    let sql = `select p.*,c.cat_name,u.nickname from posts p,category c,users u where p.cat_id = c.cat_id and u.user_id = p.user_id and p.post_id = ${postId}`;
    let sql2 = `select count(c.comment_id) as commentNum from posts p,comments c where p.post_id = c.post_id and p.post_id = ${postId}`;
    let data = await queryInfo(sql);
    let data2 = await queryInfo(sql2);
    data = data[0];
    data.commentNum = data2[0].commentNum;
    data.created = moment(data.created).format("YYYY-MM-DD HH:mm:ss");
    res.json(data);
}

apiController.latestRelease = async (req,res)=>{
    let sql = `select p.*,c.cat_name,u.nickname from posts p,category c,users u where p.cat_id = c.cat_id and u.user_id = p.user_id order by p.post_id limit 0,5`;
    let data = await queryInfo(sql);
    let newDataArr = [];
    for(var i = 0;i < data.length; i++){
        let obj = {};
        let sql = `select count(c.comment_id) as commentNum from posts p,comments c where p.post_id = c.post_id and p.post_id = ${data[i].post_id}`;
        let result = await queryInfo(sql);
        Object.assign(obj,data[i]);
        obj.commentNum = result[0].commentNum;
        newDataArr.push(obj);
    }
    res.json(newDataArr);
}


apiController.giveLike = async (req,res)=>{
    let postId = req.query.postId;
    let likeNum = req.query.likeNum;
    let sql = `select likes from posts where post_id = ${postId}`;
    let sql2 = `update posts set likes = ${Number(likeNum) + 1} where post_id = ${postId}`;
    let data2 = await queryInfo(sql2);
    let data = await queryInfo(sql);
    console.log(data[0].likes);
    let result = {};
    if(data2.affectedRows > 0){
        result.code = 200;
        result.msg = "点赞成功";
        result.likes = data[0].likes;
    }else{
        result.code = 201;
        result.msg = "点赞失败";
    }

    res.json(result);
}
module.exports = apiController;