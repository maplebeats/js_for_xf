// ==UserScript==
// @name        web QQ旋风/xuanfeng
// @namespace   web QQ旋风/xuanfeng
// @description 选中要下载文件，点击“旋风高速下载”.生成数据之后复制保存成文件，使用aria2c -s10 -x10 -i file
// @include     http://lixian.qq.com/main.html*
// @version     0.3
// @Author: maplebeats
// @mail: maplebeats@gmail.com
// ==/UserScript==

EF = {};
var fuck_tx = []
EF.test = function()
{
    alert("test success")
}

EF.get_url = function(code)
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

EF.popup = function()
{ 
    var url = fuck_tx;
    var post = [];
    var html = '<div style="height:300px;">'
    html += '<p>点击选中，复制保存至文件，使用<code>aria2 -s10 -x10 -i file</code>下载</p>'
    html += '<select id="choose"><option value=1>aria2下载文件</option><option value=2>aria2下载命令</option><option value=3>wget下载命令</option></select>'
    html += '<textarea id="dl-data" onclick=this.select() style="background:rgba(0,0,0,0);font-size:100%;height:85%;width:100%;overflow:auto;">';
    html += EF.create_data('1');
    html += '</textarea>';
    html += '</div>'
    jQuery("#choose_files_table").html(html);
    window.choose_download_files=new xfDialog("choose_download_files");
    XF.widget.msgbox.hide();
    choose_download_files.show();
    var choose = jQuery("#choose")
    choose.bind("change",function(){
        jQuery("#dl-data").html(EF.create_data(choose.val()));
    });
}

EF.create_data = function(value)
{
    var url = fuck_tx;
    var html = '';
    for(i in url){
        var data = url[i]['data']
        var cookie = data.com_cookie;
        var http = data.com_url;
        switch(value){
            case '1':
                html += http+"\n&nbsp;&nbsp;header=Cookie: FTN5K="+cookie+"\n";
                //html += "&nbsp;&nbsp;split=10<br>"
                html += "&nbsp;&nbsp;continue=true\n";
                //html += "&nbsp;&nbsp;max-conection-per-server=10<br>"
                break;
            case '2':
                html += "aria2c -c -s10 -x10 --header 'Cookie: FTN5K="+cookie+"' "+http+"\n";
                break;
            case '3':
                html += "wget -c --header Cookie:FTN5K="+cookie+" "+http+"\n";
            defalut:
                break;
        }
    }
    return html
}

EF.handle_arry = function(data)
{
    fuck_tx = []
    XF.widget.msgbox.show("正在请求下载连接...",0,20000,true);
    for(i in data){
        EF.get_url(data[i])
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
