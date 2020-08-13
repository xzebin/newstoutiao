const mysql = require("mysql");
//数据库配置信息
const conllection =  mysql.createConnection({
    host    :"localhost", //主机
    port    :'3306',    //端口
    user    :"root",    //用户名
    password:"123456",  //密码
    database:"headlines_project"     //数据库
});

//测试链接
conllection.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("连接成功");
});
module.exports = function queryInfo(sql){
    return new Promise((resolve,reject)=>{
        conllection.query(sql,(err,data)=>{
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        });
    });
}
