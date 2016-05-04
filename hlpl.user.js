// ==UserScript==
// @name         hlpl.user.js
// @namespace    https://raw.githubusercontent.com/chuxiaonan/Highlight-promotion-links-of-Baidu-search-results/master/hlpl.user.js
// @version      0.41
// @description  Highlight promotion links of Baidu search results
// @author       Chu Xiaonan
// @match        https://www.baidu.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var css = '.flipbox{display:block;position:relative;border:double 8px red;min-height:100px;-webkit-transition:width .8s cubic-bezier(0.23,1,0.32,1),height .8s cubic-bezier(0.23,1,0.32,1),-webkit-transform .8s cubic-bezier(0.175,0.885,0.32,1.275);transition:width .8s cubic-bezier(0.23,1,0.32,1),height .8s cubic-bezier(0.23,1,0.32,1),transform .8s cubic-bezier(0.175,0.885,0.32,1.275);-webkit-transform-style:preserve-3d;transform-style:preserve-3d;-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.flipbox-front{z-index:999;position:absolute;display:block;background-color:#fff;width:100%;height:100%;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-tap-highlight-color:transparent;-webkit-transition:background .15s ease,line-height .8s cubic-bezier(0.23,1,0.32,1);transition:background .15s ease,line-height .8s cubic-bezier(0.23,1,0.32,1)}.flipbox-front:hover{background-color:#f77066}.not-allowed .flipbox-front{cursor:pointer}.flipbox-back{z-index:0;position:absolute;width:100%;height:100%;background-color:#eee;color:#222;-webkit-transform:translateZ(-2px) rotateX(180deg);transform:translateZ(-2px) rotateX(180deg);overflow:hidden;-webkit-transition:box-shadow .8s ease;transition:box-shadow .8s ease;text-align:center}.flipbox-back p{margin-top:15px;margin-bottom:10px}.flipbox-back button{padding:12px 20px;width:30%;margin:0 5px;background-color:transparent;border:0;border-radius:2px;font-size:1em;cursor:pointer;-webkit-appearance:none;-webkit-tap-highlight-color:transparent;-webkit-transition:background .15s ease;transition:background .15s ease}.flipbox-back button:focus{outline:0}.flipbox-back button.yes{background-color:#2196f3;color:#fff}.flipbox-back button.yes:hover{background-color:red}.flipbox-back button.no{color:#2196f3}.flipbox-back button.no:hover{background-color:#ddd}.flipbox[data-direction="left"] .flipbox-back,.flipbox[data-direction="right"] .flipbox-back{-webkit-transform:translateZ(-2px) rotateY(180deg);transform:translateZ(-2px) rotateY(180deg)}.flipbox.is-open{border:solid 8px #eee}.flipbox.is-open .flipbox-front{pointer-events:none;z-index:0}.flipbox.is-open .flipbox-back{z-index:999}.flipbox[data-direction="top"].is-open{-webkit-transform:rotateX(180deg);transform:rotateX(180deg);box-shadow:0 -6px 8px rgba(0,0,0,0.4)}.flipbox[data-direction="right"].is-open{-webkit-transform:rotateY(180deg);transform:rotateY(180deg);box-shadow:0 6px 8px rgba(0,0,0,0.4)}.flipbox[data-direction="bottom"].is-open{-webkit-transform:rotateX(-180deg);transform:rotateX(-180deg);box-shadow:0 -6px 8px rgba(0,0,0,0.4)}.flipbox[data-direction="left"].is-open{-webkit-transform:rotateY(-180deg);transform:rotateY(-180deg);box-shadow:0 6px 8px rgba(0,0,0,0.4)}';

    function assembleFlipbox(el) {
        var h = $(el).outerHeight() + 8;
        var a = $(el).html();
        a = '<div class="flipbox-front">' + a + '</div>';
        var hb = '';
        if (h > 100) hb = ' style="margin-top:' + ((h-100)/2 + 20) + 'px;"';
        var b = '<div class="flipbox-back"><p'+ hb + '>这是一个推广链接，你确定要浏览它吗？</p><button class="yes">确定</button><button class="no">取消</button></div>';
        $(el).css("height", h+"px").addClass("flipbox not-allowed").html(b + a);
    }

    function hlpl() {
        $("#content_left").children().each(function() {
            var c = $(this).data("click");
            if (typeof c != 'undefined') {
                if (typeof c.fm != 'undefined') {
                    if (c.fm === "pp" || c.fm === "alop") { // 判定是否为百度推广链接 new-pp
                        assembleFlipbox($(this));
                    }
                } else if (typeof c.rsv_cd != 'undefined') { // 判定是否含有V徽章
                    if (/vLevel:\d/.test(c.rsv_cd)) assembleFlipbox($(this));
                }
            } else {
                $(this).children("div").each(function() {
                    var d = $(this).data("click");
                    if (typeof d != 'undefined' && typeof d.fm != 'undefined') {
                        if (d.fm === "ppim") { // 判定是否为百度推广链接 new-ppim
                            assembleFlipbox($(this));
                        }
                    }
                });
            }
        });
        $("#content_left").prepend('<div id="ajaxFreshed"></div>');
    }

    function bindFlipboxEvent() {
        $('.flipbox').each(function() {
            var flipbox = this;
            var flipboxFront = flipbox.querySelector('.flipbox-front'),
                btnYes = flipbox.querySelector('.flipbox-back .yes'),
                btnNo = flipbox.querySelector('.flipbox-back .no');

            flipboxFront.addEventListener('click', function(event) {
                var notAllowed = $(this).closest(".flipbox").hasClass("not-allowed");
                if (notAllowed) {
                    var mx = event.clientX - flipbox.offsetLeft,
                        my = event.clientY - flipbox.offsetTop;

                    var w = flipbox.offsetWidth,
                        h = flipbox.offsetHeight;

                    var directions = [
                        {id: 'top', x: w/2, y: 0},
                        {id: 'right', x: w, y: h/2},
                        {id: 'bottom', x: w/2, y: h},
                        {id: 'left', x: 0, y: h/2},
                    ];

                    directions.sort(function(a, b) {
                        return distance(mx, my, a.x, a.y) - distance(mx, my, b.x, b.y);
                    });
                    flipbox.setAttribute('data-direction', directions.shift().id);
                    flipbox.classList.add('is-open');
                }
            } );

            btnYes.addEventListener( 'click', function(event) {
                flipbox.classList.remove('not-allowed');
                flipbox.classList.remove('is-open');
            } );
            btnNo.addEventListener('click', function(event){
                flipbox.classList.remove('is-open');
            });
        });
    }

    function distance(x1, y1, x2, y2) {
        var dx = x1-x2;
        var dy = y1-y2;
        return Math.sqrt(dx*dx + dy*dy);
    }

    $(document).ajaxComplete(function(event, request, settings) {
        if (!document.getElementById("ajaxFreshed")) {
            $("<style>").text(css).appendTo("head");
            hlpl();
            bindFlipboxEvent();
        }
    });

    $(document).ready(function() {
        $("<style>").text(css).appendTo("head");
        hlpl();
        bindFlipboxEvent();

        $('div').on("click", ".not-allowed", function(event){
            event.preventDefault();
        });
    });
})();
