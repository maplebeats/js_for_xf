// ==UserScript==
// @name        web QQ旋风/xuanfeng
// @namespace   web QQ旋风/xuanfeng
// @description 选中要下载文件，点击“旋风高速下载”
// @include     http://lixian.qq.com/main.html*
// @version     0.7
// @Author: maplebeats
// @mail: maplebeats@gmail.com
// ==/UserScript==

/*
 * BUG:文件重名无法正常下载
 * TODO:aria2-rpc状态检查等
 */

EF = {};
var fuck_tx = [];

//强迫症。。。去掉无用的元素
jQuery("#share_opt").remove();
jQuery("#down_box").remove();
jQuery(".mod_copyright").remove();
jQuery(".top").remove();
//init
jQuery("#task_share_multi em").html("其它软件导出");
EventHandler.task_share = function(e)
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
EventHandler.task_batch2local = EventHandler.task_share; //把旋风高速的键钮也X掉了

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
                    var url = data["data"];
                    var temp_json = {"name":code.filename,"url":url.com_url,"cookie":url.com_cookie};
                    fuck_tx.push(temp_json);
                }
                else{
                    XF.widget.msgbox.show("请求url失败",2,2000);
                }
            },
            error:function(){
                 XF.widget.msgbox.show("请求url失败",2,2000);
            }
     });
}
EF.rpc = function()
{   
    var data = fuck_tx;
    var url = jQuery("#rpc-url").val();
    for(i in data){
        var tmp = data[i];
        var uri = {'jsonrpc':'2.0','id':(new Date()).getTime().toString(),'method':'aria2.addUri','params':[[tmp.url, ], {'out':tmp.name,'header':'Cookie: FTN5K='+tmp.cookie}]};/*,'split':'10','continue':'true','max-conection-per-server':'5','parameterized-uri':'true'}]};*/
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url + "?tt="+(new Date()).getTime().toString(), true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.send(JSON.stringify(uri));
    }
    XF.widget.msgbox.show("任务已经添加至aria2-rpc,请自行查看",0,2000,true)
}
EF.update = function(data)
{ 
    //jQuery("#dl-data").html(data);
    var href = "data:text/html;charset=utf-8," + encodeURIComponent(data);
    jQuery("#save-as").attr("href",href);
}

EF.init_pop = function()
{
    var html = '<div class="choose_start" style="height:300px;">';
    html += '<p>运行<code>aria2c -c -s10 -x10 -i file</code>使用下载文件</p>';
    html += '<div>';
    html += '<select id="choose" style="background:rgba(255,255,255,0.5);"><option value=1>aria2文件</option><option value=2>aria2命令</option><option value=3>wget命令</option><option value=4>IDM文件</option></select>';
    html += '---><a id="save-as" style="" href="data:text/html;charset=utf-8,'+encodeURIComponent(EF.create_data('1'))+'" target="_blank" title="右键另存为" download="test"><span><em>导出文件(右键另存为)</span></em></a>';
    html += '</div>';
    html += '<div style="margin-top: 20px;">';
    html += '<p>后台运行<code>aria2c -c -s10 -x10 --enable-rpc</code>即可直接使用RPC按钮增加任务</p>';
    html += '<div><input id="rpc-url" type="text" style="width:200px;background:rgba(0,0,0,0);" onFocus=\"this.value=\'\'\" value="http://localhost:6800/jsonrpc"></input></div><div id="rpc" class="com_opt_btn"><span><em>RPC</em></span></div>';
    html += '</div>';
    //html += '<textarea id="dl-data" onclick=this.select() style="background:rgba(0,0,0,0);font-size:100%;height:85%;width:100%;overflow:auto;">';
    //html += EF.create_data('1');
    //html += '</textarea>';
    html += '</div>';
    jQuery("#choose_files_table").html(html);
    window.choose_download_files=new xfDialog("choose_download_files");
    XF.widget.msgbox.hide();
    choose_download_files.show();
    jQuery(".com_win_head_wrap em").html("导出");
    var issue = "<a href='https://github.com/maplebeats/js_for_xf'><em>issue地址</em></a>";
    jQuery(".opt").html(issue);
    var rpc = jQuery("#rpc");
    rpc.bind("click",function(){
            EF.rpc();
    });
    var choose = jQuery("#choose");
    choose.bind("change",function(){
        EF.update(EF.create_data(choose.val()));
    });
}

EF.create_data = function(value)
{
    var url = fuck_tx;
    var html = '';
    for(i in url){
        var data = url[i];
        var cookie = data.cookie;
        var http = data.url;
        var name = data.name;
        switch(value){
            case '1':
                html += http+"\n  header=Cookie: FTN5K="+cookie+"\n";
                html += "  out="+name+"\n";
                html += "  continue=true\n";
                //html += "  parameterized-uri=true\n";
                //html += "  max-conection-per-server=5\n";
                //html += "  split=10\n"; //谁能告诉我为什么这个设置了完全无效？？？？
                break;
            case '2':
                html += "aria2c -c -s10 -x10 -o '"+ name +"' --header 'Cookie: FTN5K="+cookie+"' "+http+"\n";
                break;
            case '3':
                html += "wget -c -O "+ name +"--header Cookie:FTN5K="+cookie+" "+http+"\n";
                break;
            case '4':
                html +='<\r\n'+http+'\r\ncookie: FTN5K='+cookie+'\r\n>\r\n'
                break;
            defalut:
                break;
        }
    }
    return html
}

EF.handle_arry = function(data)
{
    fuck_tx = [];
    XF.widget.msgbox.show("正在请求下载连接...",0,20000,true);
    for(i in data){
        EF.get_url(data[i]);
    }
    EF.init_pop();
}
