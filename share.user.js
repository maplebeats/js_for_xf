// ==UserScript==
// @name        xf share
// @namespace   xf
// @description qq xf fenxiang
// @include     http://fenxiang.qq.com*
// @version     0.1
// @Author: maplebeats
// @mail: maplebeats@gmail.com
// ==/UserScript==

function contentEval(source) {
    // Check for function input.
    if ('function' == typeof source) {
        // Execute this function with no arguments, by adding parentheses.
        // One set around the function, required for valid syntax, and a
        // second empty set calls the surrounded function.
        source = '(' + source + ')();'
    }

    // Create a script node holding this  source code.
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = source;

    // Insert the script node into the page, so it will run, and immediately
    // remove it to clean up.
    document.body.appendChild(script);
    document.body.removeChild(script);
}
contentEval(function () {
    function aria2(filename,filehash){
        $.ajax({
                type: "POST",
                url:API_URL.handler_url+"/getComUrl",
                cache: false,
                data:{"filename":filename,"filehash":filehash},
                timeout:3000,
                dataType: "json",
                success:function(data){
                  if(data&&data.ret==0){
                     console.log(data);
                     var name = filename;
                     var cookie = data.data.com_cookie;
                     var http = data.data.com_url;
                     var html = "aria2c -c -s10 -x10 -o '" + name + "' --header 'Cookie: FTN5K=" + cookie + "' " + http + "\n";
                     var href="data:text/html;charset=utf-8," + encodeURIComponent(html);
                     window.location=href;
                  }
                 },
                error:function(){
                      XF.widget.msgbox.show("获取普通下载链失败,请重试!",2,2000);
                 }
         });
    }
    $('.btn_normal').unbind();
    $('.btn_normal').live("click",function(){
        //获取选择的列表
        var checked_list=$(".file_list_checkbox:checked");
        if(checked_list.size()>0){
              var filename=checked_list.eq(0).parent().next().find("a").attr("title");
              var filehash=checked_list.eq(0).parent().next().find("a").attr("filehash");
              aria2(filename,filehash);
        }else{
            XF.widget.msgbox.show("您还没选择文件呢!",2,2000);
        }
    } );
});
