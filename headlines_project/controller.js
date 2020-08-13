const mysql = require("mysql");
const fs = require("fs");
const { json } = require("express");
const { all } = require("./route");
const moment = require("moment");
const queryInfo = require("./model.js"); 

//定义分页的每页条数
const pageSize = 10;

let controller = {};


//渲染后台主页数据
controller.getIndex = async (req,res)=>{
    //获取文章总数
    let sql1 = "select count(*) as postsCount from posts";
    //获取文章中草稿的篇数
    let sql2 = "select count(*) as draftedCount from posts where status = 'drafted'";
    //获取总分类数
    let sql3 = "select count(*) as cateCount from category";
    //获取评论数
    let sql4 = "select COUNT(*) AS commentsCount  from comments ";
    //获取待审核的评论数
    let sql5 = "select COUNT(*) AS heldCount from comments WHERE STATUS = 'held' ";

    let p1 = queryInfo(sql1);
    let p2 = queryInfo(sql2);
    let p3 = queryInfo(sql3);
    let p4 = queryInfo(sql4);
    let p5 = queryInfo(sql5);
    // let resultObj = {};
    //调用Promise的all方法，让promise对象并发执行
    let data = await  Promise.all([p1,p2,p3,p4,p5]);
    //将数据库获取出来的数据放入resultObj对象中并分配给index首页
    data.map((v)=>{
        Object.assign(data,v[0]);
    });
    data.currentUser = req.session.currentUser.name;
    res.render("index.html",data);
}
//获取文章列表数据
controller.getPostLis = async (req,res)=>{
    let code = req.query.code;

    let postsStatus = [
        {"key":"drafted","value":"草稿"},
        {"key":"published","value":"已发布"},
        {"key":"trashed","value":"已作废"},
    ];
    let sql = "select cat_id,cat_name from category";
    let categoryStatus = await queryInfo(sql);  
    res.render("posts.html",{"postsStatus":postsStatus,"categoryStatus":categoryStatus,"code":code});
}
//获取评论列表数据
controller.getCommentsLis = (req,res)=>{
    res.render("comments.html");
}

//渲染文章列表页面数据
controller.getPosts = async (req,res)=>{
    let page = req.query.page;
    let result = req.query.params;
    let where = ``;
    if(result){
        let {classification,allStatus} = result;
        if(classification){
            where += ` and p.cat_id = ${classification}`;
        }
        if(allStatus){
            where += ` and p.status = '${allStatus}'`;
        }
    }
    //查询当前页码的数据
    let sql2 = `select p.*,u.nickname,c.cat_name from posts p,users u,category c where p.user_id = u.user_id and c.cat_id = p.cat_id ${where} order by post_id desc limit ${(page - 1) * pageSize},${pageSize}` ;
    let data = await queryInfo(sql2);
    res.json(data);
}
//渲染登录页面
controller.getLogin = (req,res)=>{
    res.render("login.html");
}

//验证登录
controller.checkLogin = async (req,res)=>{
    let sql = `select * from users where email = "${req.body.email}" and password = "${req.body.password}"`;
    let data = await queryInfo(sql)
    let result = {};
    if(data[0]){
        result.code = 200,
        req.session.currentUser = {"name":data[0].nickname,"id":data[0].user_id,"email":data[0].email,"photo":data[0].photo,"intro":data[0].intro,"password":data[0].password};
        result.msg = "登录成功"
    }else{
        result.code = 201,
        result.msg = "邮箱或密码不正确！！！"
    }
    res.json(result);
}
//获取文章分页的总页码
controller.getTotalPage = async (req,res)=>{
    let where = `where 1=1 `;
    let {classification,allStatus} = req.query;
    if(classification){
        where += `and cat_id = ${classification} `;
    }
    if(allStatus){
        where += `and status = '${allStatus}'`;
    }
    let sql = `select count(*) as postsCount from posts ${where}`;
    let data = await queryInfo(sql);
    res.json({"totalCount":Math.ceil(parseInt(data[0].postsCount) / pageSize)});
}

//渲染文章页面
controller.getAddPost = async (req,res)=>{
    let postsStatus = [
        {"key":"drafted","value":"草稿"},
        {"key":"published","value":"已发布"},
        {"key":"trashed","value":"已作废"},
    ];
    let sql = "select cat_name from category";
    let data = await queryInfo(sql)
    res.render("post-add.html",{
        postsStatus:postsStatus,
        cateGoryName:data
    });
}

//删除文章
controller.delPost = async (req,res)=>{
    let postId = req.query.postId;
    let sql = `delete from posts where post_id = ${ postId }`;
    let sql2 = `select * from posts where post_id = ${ postId }`;
    let data2 = await queryInfo(sql2);
    let data = await queryInfo(sql)
    let resutltObj = {};
    if(data.affectedRows){
        resutltObj.code = 200;
        resutltObj.msg = "删除成功";
        resutltObj.icon = 1;
        let path = data2[0].feature;
        fs.unlink(`${__dirname}${path}`, (err) => {
            if (err) throw err;
            console.log(`文件：${path} 已被删除`);
        });
    }else{
        resutltObj.code = 201;
        resutltObj.msg = "删除失败";
        resutltObj.icon = 2;
    }
    res.json(resutltObj);
}


//获取评论分页的总页码
controller.getCommentsTotalPage = async (req,res)=>{
    let sql = "select count(*) as commentsCount from comments";
    let data = await queryInfo(sql);
    res.json({"totalCount":Math.ceil(parseInt(data[0].commentsCount) / pageSize)});
}

//渲染评论列表页面数据
controller.getComments = async (req,res)=>{
    let page = req.query.page;
    //查询当前页码的数据
    let sql2 = `select * from comments limit ${(page - 1) * pageSize},${pageSize}` ;
    let data = await queryInfo(sql2);
    res.json(data);
}

//添加文章的图片上传
controller.uploadImg = (req,res)=>{
    var {destination,filename,originalname} = req.file;
    var oldName = `${destination}${filename}`;
    var sfx = originalname.substring( originalname.lastIndexOf(".") );
    var newName = `${destination}${filename}${sfx}`;
    fs.rename(oldName,newName,(err)=>{
        if(err){
            throw err.message;
        }
        let urlStr = newName.substring(1);
        res.json({"imgUrl":urlStr});
    })
}

//添加文章
controller.savePost = async (req,res)=>{
    let {title,content,imgurl,category,created,status} = req.body;
    let id = req.session.currentUser.id;
    let sql = `insert into posts(title,created,content,status,feature,user_id,cat_id) values('${title}','${created}','${content}','${status}','${imgurl}','${id}','${category}')`;
    let data = await queryInfo(sql);
    if(data.affectedRows > 0){
        res.json({
            code:200,
            msg:"添加成功",
            icon:1
        });
    }else{
        res.json({
            code:201,
            msg:"添加失败",
            icon:2
        });
    }
}

controller.getImgByEamil = async (req,res)=>{
    let emailValue = req.query.emailValue;
    let sql = `select * from users where email = '${emailValue}'`;
    let result = await queryInfo(sql);
    if(result.length > 0){
        res.json({"photo":result[0].photo});
    }else{
        res.json({"photo":"/public/img/default.png"});
    }
}

//退出登录
controller.loginOut = (req,res)=>{
    req.session.destroy(function(err) {
        if(err){throw err}
    });
    res.sendFile(__dirname + "/views/admin/login.html");
}

controller.getEditPost = async (req,res)=>{
    let postId = req.query.postId;
    let sql = `select * from posts where post_id = ${postId}`;
    let data = await queryInfo(sql);
    let postsStatus = [
        {"key":"drafted","value":"草稿"},
        {"key":"published","value":"已发布"},
        {"key":"trashed","value":"已作废"},
    ];
    let sql2 = "select cat_id,cat_name from category";
    let categoryStatus = await queryInfo(sql2);  
    data[0].postsStatus = postsStatus;
    data[0].categoryStatus = categoryStatus;
    data[0].created = moment(data[0].created).format("YYYY-MM-DD HH:mm:ss");
    res.render("editPost.html",{data:data[0]});
}

controller.editPost = async (req,res)=>{
    let {postId,title,content,oldUrl,category,created,status} = req.body;
    let sql = `update posts set title = '${title}', content = '${content}' ,feature = '${oldUrl}', cat_id = '${category}', created = '${created}', status = '${status}' where post_id = '${postId}' `
    let data = await queryInfo(sql);
    if(data.affectedRows > 0){
        res.json({
            code:200,
            msg:"修改成功",
            data:req.body,
            icon:1
        });
    }else{
        res.json({
            code:201,
            msg:"修改失败",
            icon:2
        });
    }
}

controller.getUserLists = (req,res)=>{
    res.render("users.html");
}

controller.getProFile = (req,res)=>{
    let currentUser = req.session.currentUser;
    res.render("profile.html",currentUser);
}
controller.getPwdReset = (req,res)=>{
    res.render("password-reset.html");
}
controller.checkPwd = (req,res)=>{
    let oldPwd = req.query.oldPwd;
    let currentUserPwd = req.session.currentUser.password;
    if(oldPwd == currentUserPwd){
        res.json({
            code:200,
            msg:"旧密码校验成功"
        });
    }else{
        res.json({
            code:201,
            msg:"旧密码校验失败，请重新输入"
        });
    }
}
controller.updatePwd = async (req,res)=>{
    let {newPwd} = req.body;
    let userId = req.session.currentUser.id;
    let sql = `update users set password = '${newPwd}' where user_id = '${userId}'`;
    let data = await queryInfo(sql);
    if(data.affectedRows > 0){
        req.session.destroy(function(err) {
            if(err){throw err}
        });
        res.json({
            code:200,
            msg:"修改成功"
        });
    }else{
        res.json({
            code:201,
            msg:"修改失败"
        });
    }
}
controller.getSessionInfo = (req,res)=>{
    let currentUser = req.session.currentUser;
    res.json(currentUser);
}


controller.updateCurrentUserInfo = async (req,res)=>{
    let {nickname,intro,imgUrl} = req.body;
    if(!nickname){
        nickname = "未定义";
    }
    if(!intro){
        intro = "这个人很懒，什么都没有留下！";
    }
    let userId = req.session.currentUser.id;
    let sql = `update users set nickname = '${nickname}',intro = '${intro}',photo = '${imgUrl}' where user_id = '${userId}'`;
    let data = await queryInfo(sql);
    let resultObj = {};
    if(data.affectedRows){
        resultObj.code = 200,
        resultObj.msg = "修改成功"
        req.session.currentUser.name = nickname;
        req.session.currentUser.photo = imgUrl;
        req.session.currentUser.intro = intro;

    }else{
        resultObj.code = 201,
        resultObj.msg = "修改失败"
    }
    res.json(resultObj);
}

controller.getUsersTotalPage = async (req,res)=>{
    let sql = "select count(*) as userCount from users";
    let data = await queryInfo(sql);
    res.json({"totalCount":Math.ceil(parseInt(data[0].userCount) / pageSize)});
}

controller.getUsers = (req,res)=>{
    res.render("users.html");
}

controller.getUserLists = async (req,res)=>{
    let page = req.query.page;
    let userId = req.session.currentUser.id;
    //查询当前页码的数据
    let sql2 = `select * from users where user_id <> ${userId} limit ${(page - 1) * pageSize},${pageSize}` ;
    let data = await queryInfo(sql2);
    res.json(data);
}   

controller.addUser = async (req,res)=>{
    let {email,nickname,password,imgUrl,userStatu,intro} = req.body;
    if(nickname == ""){
        nickname = "未定义";
    }
    if(userStatu == ""){
        userStatu = "unactivated";
    }
    if(intro == ""){
        intro = "该用户很懒，什么都没有留下！";
    }
    let sql = `insert into users(email,password,nickname,photo,status,intro) values('${email}','${password}','${nickname}','${imgUrl}','${userStatu}','${intro}')`;
    let sql2 = `select user_id from users where email = '${email}' and password = '${password}'`;
    let data = await queryInfo(sql);
    let result = {}
    if(data.affectedRows){
        let data2 = await queryInfo(sql2);
        let user_id = data2[0].user_id;
        result.code = 200;
        result.msg = "新增成功";
        result.info = {email,nickname,imgUrl,userStatu,user_id};
    }else{
        result.code = 201;
        result.msg = "新增失败";
    }
    res.json(result);
}

controller.editUserInfo = async (req,res)=>{
    let userId = req.query.userId;
    let sql = `select * from users where user_id = ${userId}`;
    let data = await queryInfo(sql);
    res.render("editUser.html",data[0]);
}

controller.editUser = async (req,res)=>{
    let {userId,nickname,intro,imgUrl} = req.body;
    if(nickname == ""){
        nickname = "未定义";
    }
    if(intro == ""){
        intro = "该用户很懒，什么都没有留下";
    }
    let sql = `update users set nickname = '${nickname}',intro = '${intro}',photo = '${imgUrl}' where user_id = '${userId}'`;
    let data = await queryInfo(sql);
    let resultObj = {};
    if(data.affectedRows){
        resultObj.code = 200,
        resultObj.msg = "编辑成功"
    }else{
        resultObj.code = 201,
        resultObj.msg = "编辑失败"
    }
    res.json(resultObj);
}

controller.deleteUser = async (req,res)=>{
    let userId = req.params.userId;
    let sql = `delete from users where user_id = ${userId}`;
    let sql2 = `select * from users where user_id = ${ userId }`;
    let data2 = await queryInfo(sql2);
    let data = await queryInfo(sql);
    let resultObj = {};
    if(data.affectedRows){
        resultObj.code = 200;
        resultObj.msg = "删除成功"
        let path = data2[0].photo;
        fs.unlink(`${__dirname}${path}`, (err) => {
            if (err) throw err;
            console.log(`文件：${path} 已被删除`);
        });
    }else{
        resultObj.code = 201;
        resultObj.msg = "删除失败"
    }
    res.json(resultObj);
}

controller.splitCatalog = (req,res)=>{
    res.render("categories.html");
}

controller.getCateGoriesTotalPage = async (req,res)=>{
    let sql = "select count(*) as categoryCount from category";
    let data = await queryInfo(sql);
    res.json({"totalCount":Math.ceil(parseInt(data[0].categoryCount) / pageSize)});
}
controller.getCategoriesLists = async (req,res)=>{
    let page = req.query.page;
    //查询当前页码的数据
    let sql2 = `select * from category limit ${(page - 1) * pageSize},${pageSize}` ;
    let data = await queryInfo(sql2);
    res.json(data);
}


controller.addCateGories = async (req,res)=>{
    let {catName,classname} = req.body;
    let sql = `insert into category(cat_name,classname) values('${catName}','${classname}')`;
    let data = await queryInfo(sql);
    let result = {};
    if(data.affectedRows){
        let sql2 = `select * from category where cat_id = ${data.insertId}`;
        let data2 = await queryInfo(sql2);
        result.code = 200;
        result.msg = "添加成功";
        result.result = data2[0];
    }else{
        result.code = 201,
        result.msg = "添加失败"
    }
    res.json(result);
}

controller.delCateGories = async (req,res)=>{
    let catId = await req.params.catId;
    let sql = `delete from category where cat_id = ${catId}`;
    let data = await queryInfo(sql);
    let result = {};
    if(data.affectedRows){
        result.code = 200;
        result.msg = "删除成功";
    }else{
        result.code = 201;
        result.msg = "删除失败";
    }
    res.json(result);
}

controller.editCateGoritesHtml = async (req,res)=>{
    let catId = req.query.catId;
    let sql = `select * from category where cat_id = ${catId}`;
    let data = await queryInfo(sql);
    data = data[0];
    res.render("editCateGories.html",data);
}

controller.editCateGories = async (req,res)=>{
    let {catId,name,classname} = req.body;
    let sql = `update category set cat_name = '${name}',classname = '${classname}' where cat_id = '${catId}'`;
    let data = await queryInfo(sql);
    let result = {};
    if(data.affectedRows){
        result.code = 200;
        result.msg = "编辑成功";
    }else{
        result.code = 201;
        result.msg = "编辑失败";
    }
    res.json(result);
}

controller.delComment = async (req,res)=>{
    let commentId = req.query.commentId;
    let sql = `delete from comments where comment_id = '${commentId}'`;
    let data = await queryInfo(sql);
    let resultObj = {};
    if(data.affectedRows){
        resultObj.code = 200;
        resultObj.msg = "删除成功";
    }else{
        resultObj.code = 201;
        resultObj.msg = "删除失败";
    }
    res.json(resultObj);
}

controller.approvalComment = async (req,res)=>{
    let commentId = req.query.commentId;
    let comStatus = req.query.comStatus;
    let sql = `update comments set status = '${comStatus}' where comment_id = '${commentId}'`;
    let data = await queryInfo(sql);
    let resultObj = {};
    if(data.affectedRows){
        resultObj.code = 200;
    }else{
        resultObj.code = 201;
    }
    res.json(resultObj);
}

controller.getSlidesHtml = (req,res)=>{
    res.render("slides.html");
}

controller.getSwipes = async (req,res)=>{
    let sql = "select * from swipe";
    let data = await queryInfo(sql);
    res.json(data);
}
module.exports = controller;