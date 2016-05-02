// ==UserScript==
// @name         hlpl.user.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Highlight promotion links of Baidu search results
// @author       Chu Xiaonan
// @match        https://www.baidu.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
var css = '.btn{display:block;position:relative;border:double 8px red;-webkit-transition:width .8s cubic-bezier(0.23,1,0.32,1),height .8s cubic-bezier(0.23,1,0.32,1),-webkit-transform .8s cubic-bezier(0.175,0.885,0.32,1.275);transition:width .8s cubic-bezier(0.23,1,0.32,1),height .8s cubic-bezier(0.23,1,0.32,1),transform .8s cubic-bezier(0.175,0.885,0.32,1.275);-webkit-transform-style:preserve-3d;transform-style:preserve-3d;-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.btn-front{z-index:999;position:absolute;display:block;background-color:#fff;width:100%;height:100%;cursor:pointer;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-tap-highlight-color:transparent;-webkit-transition:background .15s ease,line-height .8s cubic-bezier(0.23,1,0.32,1);transition:background .15s ease,line-height .8s cubic-bezier(0.23,1,0.32,1)}.btn-front:hover{background-color:#f77066}.btn-back{z-index:0;position:absolute;width:100%;height:100%;background-color:#eee;color:#222;-webkit-transform:translateZ(-2px) rotateX(180deg);transform:translateZ(-2px) rotateX(180deg);overflow:hidden;-webkit-transition:box-shadow .8s ease;transition:box-shadow .8s ease;text-align:center}.btn-back p{margin-top:25px;margin-bottom:10px}.btn-back button{padding:12px 20px;width:30%;margin:0 5px;background-color:transparent;border:0;border-radius:2px;font-size:1em;cursor:pointer;-webkit-appearance:none;-webkit-tap-highlight-color:transparent;-webkit-transition:background .15s ease;transition:background .15s ease}.btn-back button:focus{outline:0}.btn-back button.yes{background-color:#2196f3;color:#fff}.btn-back button.yes:hover{background-color:red}.btn-back button.no{color:#2196f3}.btn-back button.no:hover{background-color:#ddd}.btn[data-direction="left"] .btn-back,.btn[data-direction="right"] .btn-back{-webkit-transform:translateZ(-2px) rotateY(180deg);transform:translateZ(-2px) rotateY(180deg)}.btn.is-open{border:0}.btn.is-open .btn-front{pointer-events:none;z-index:0}.btn.is-open .btn-back{z-index:999;box-shadow:0 8px 25px rgba(0,0,0,0.4)}.btn[data-direction="top"].is-open{-webkit-transform:rotateX(180deg);transform:rotateX(180deg)}.btn[data-direction="right"].is-open{-webkit-transform:rotateY(180deg);transform:rotateY(180deg)}.btn[data-direction="bottom"].is-open{-webkit-transform:rotateX(-180deg);transform:rotateX(-180deg)}.btn[data-direction="left"].is-open{-webkit-transform:rotateY(-180deg);transform:rotateY(-180deg)}';

$("<style>").text(css).appendTo("head");

function assemble_flipbox(el) {
	var h = 0;
	$(el).children().each(function(){
		h += $(this).outerHeight();
	});
	var a = $(el).html();
	a = '<div class="btn-front">' + a + '</div>';
	var b = '<div class="btn-back"><p>这是一个推广链接，你确定要浏览它吗？</p><button class="yes">确定</button><button class="no">取消</button></div>';
	$(el).css({"height": h+"px", "min-height": "100px"}).addClass("btn not-allowed").html(b + a);
}

$("#content_left").children().each(function(){
	var c = $(this).data("click");
	if (typeof c != 'undefined') {
		if (typeof c.fm != 'undefined') {
			if (c.fm === "pp") { // 判定是否为百度推广链接 new-pp
				assemble_flipbox($(this));
			}
		}
	} else {
		$(this).children("div").each(function(){
			var d = $(this).data("click");
			if (typeof d != 'undefined' && typeof d.fm != 'undefined') {
				if (d.fm === "ppim") { // 判定是否为百度推广链接 new-ppim
					assemble_flipbox($(this));
				}
			}
		});
	}
});
    
})();



$(document).ready(function(){
	$('.btn').each(function(){
		var btn = this;
		var btnFront = btn.querySelector( '.btn-front' ),
		btnYes = btn.querySelector( '.btn-back .yes' ),
		btnNo = btn.querySelector( '.btn-back .no' );

		btnFront.addEventListener( 'click', function( event ) {
			var notAllowed = $(this).closest(".btn").hasClass("not-allowed");
			if (notAllowed) {
				var mx = event.clientX - btn.offsetLeft,
					my = event.clientY - btn.offsetTop;

				var w = btn.offsetWidth,
					h = btn.offsetHeight;

				var directions = [
					{ id: 'top', x: w/2, y: 0 },
					{ id: 'right', x: w, y: h/2 },
					{ id: 'bottom', x: w/2, y: h },
					{ id: 'left', x: 0, y: h/2 }
				];

				directions.sort( function( a, b ) {
					return distance( mx, my, a.x, a.y ) - distance( mx, my, b.x, b.y );
				} );

				btn.setAttribute( 'data-direction', directions.shift().id );
				btn.classList.add( 'is-open' );
			}
			
		} );

		btnYes.addEventListener( 'click', function( event ) {
			btn.classList.remove( 'not-allowed' );
			btn.classList.remove( 'is-open' );
		} );

		btnNo.addEventListener( 'click', function( event ) {
			btn.classList.remove( 'is-open' );
		} );
	});

	$('div').on("click", ".not-allowed", function(event){
		event.preventDefault();
	});

	function distance( x1, y1, x2, y2 ) {
		var dx = x1-x2;
		var dy = y1-y2;
		return Math.sqrt( dx*dx + dy*dy );
	}
});
