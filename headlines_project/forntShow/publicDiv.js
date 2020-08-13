window.onload = function(){
    //分类菜单栏：发送ajax获取所有分类
  $.get(publicPath + "/getCateGory",function(data){
    let result = ``;
    data.forEach(element => {
      result += `
        <li><a href="list.html?catId=${element.cat_id}"><i class="fa ${element.classname}"></i>${element.cat_name}</a></li>
      `;
    });
    $("#classificationMenuBar").html(result);
});
}