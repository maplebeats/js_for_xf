// ==UserScript==
// @name        xf to aria2
// @namespace   xf to aria2
// @description 在web上生成aria2的下载命令,todo文件...选中要下载文件，点击“旋风高速下载”
// @include     http://lixian.qq.com/main.html*
// @version     0.1
// @Author: maplebeats
// @mail: maplebeats@gmail.com
// ==/UserScript==

EF = {};
var fuck_tx = []
function FTN5K(value)
{
    document.cookie="FTN5K=" +escape(value);
}

EF.get_url = function(code,callback)
{
    jQuery.ajax({
            type:"post",
            url:"/handler/lixian/get_http_url.php",
            data:code,
            cache: false,
            timeout:10000,
            dataType: "json",
            async: false, //TvT
            success: function(data){
                if(data&&data.ret==0){
                    fuck_tx.push(data)
                }
                else{
                    XF.widget.msgbox.show("请求url失败，FUCK YOU 腾迅",2,2000);
                }
            },
            error:function(){
                 XF.widget.msgbox.show("请求url失败，FUCK YOU 腾迅",2,2000);
            }
         });
}

EF.popup = function(arr)
{ 
    var url = fuck_tx;
    var html = '<div>';
    for(i in url){
        var data = url[i]['data']
        var cookie = data.com_cookie;
        html += "<p>aria2c -c -s10 -x10 --header 'Cookie: FTN5K="+cookie+"' "+data.com_url+"</p>";
    }
    //aria2文件下载  header=Cookie: FTN5K=b672c1e1
    html += '</div>'
    jQuery("#choose_files_table").html(html);
    window.choose_download_files=new xfDialog("choose_download_files");
    XF.widget.msgbox.hide();
    choose_download_files.show();
    //XF.widget.msgbox.show("<a href="+data["data"].com_url+">下载连接</a>\nfuckyou",2,6000);
}

EF.handle_arry = function(data)
{
    fuck_tx = []
    XF.widget.msgbox.show("正在请求下载连接...",0,20000,true);
    for(i in data){
        EF.get_url(data[i],EF.handle_url)
    }
    EF.popup()
}

EventHandler.task_batch2local = function(e)
{
    var disabled=jQuery(e).hasClass("disabled_btn");
    if(disabled){
        return false;
    }
    
    var dl_tasks = [];
    var tmp_taskid_str = '';
    var tasks_count = 0;
    for(var task_id in g_task_op.last_task_info){
        var tmp_obj = g_task_op.last_task_info[task_id];

        if(check_failed_task(task_id)) continue;
        var checkbox_elem = $('task_sel_' + task_id);
        if(checkbox_elem && !checkbox_elem.checked) continue;
        if(tmp_obj == null || tmp_obj.file_size != tmp_obj.comp_size)   continue;
        if(tmp_obj.dl_status != TASK_STATUS['ST_UL_OK']) continue;
        
        var json_temp={"filename":tmp_obj.file_name,"hash":tmp_obj.code,"browser":"other"};
        dl_tasks.push(json_temp);
        tmp_taskid_str = task_id;
        tasks_count++;
    }
    
    if(tasks_count == 0){
    }
    else{
        EF.handle_arry(dl_tasks);
    }
}
