// ==UserScript==
// @name        xuanfeng autologin
// @namespace   xuanfeng autologin
// @description qq旋风自动登陆,使用前请手动设置账号密码
// @include     http://lixian.qq.com/login.html*
// @version     0.1
// @Author: maplebeats
// @mail: maplebeats@gmail.com
// ==/UserScript==
//
$(function(){
    XFLogin.init_login_new();
    var login_win=new xfDialog("login_win");
    login_win.show();
    $('#login_frame_new').load(function(){
        var $iframe = $(this), 
            $contents = $iframe.contents();
        var u = '账号';
        var p = '密码';
        $contents.find('#u').val(u);
        $contents.find('#p').val(p);
        $contents.find('#login_button').trigger("click");
    });
});
