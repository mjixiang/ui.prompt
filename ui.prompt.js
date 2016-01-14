/**
    author:mjixiang
*/
/*========== prompt window =========*/
(function () {
    var showindex = 0;  //主要用于 弹出层z-index
    function prompt(options) {
        if (typeof options == "object") {
            options = $.extend({
                title: "",
                html: "", //可以为html碎片或url(只限于.html后缀)
                buttons: []
            }, options);
        } else {
            options = {
                title: arguments[0].toString(),
                html: arguments[1].toString(),
                buttons: arguments[2] || []
            }
        }
        //----以上将参数均转换成统一对象形式---
        var p = new popup(options);
        return p;
    }
    //
    function popup(options) {
        var self = this,popupDom = null,exeClose,exeLoad;
        this.onClose = function (callback) { exeClose = callback; };
        this.onLoad = function (callback) { exeLoad = callback; };
        //显示并将弹框居于顶层
        this.show = function () {
            popupDom.parents(".popup-box").show();
            popupDom.siblings(".layer").css("z-index", 1000 + showindex);
            popupDom.css("z-index", 1001 + showindex);
            showindex += 2;
        }
        //隐藏
        this.hide = function () {
            popupDom.parents(".popup-box").hide();
        }
        //关闭
        this.close = function () {
            if (typeof (exeClose) == "function") exeClose();
            popupDom.parents(".popup-box").remove();
        }
        this.resize = function(){
            autosize(popupDom)
        }
        //创建一个新窗体
        var create = function () {
            var html = '<div class="popup-box"><div class="layer"></div><div class="popup"><div class="title"><div class="name fl">';
            html += options.title;
            html += '</div><div class="close fr"></div></div><div class="main"></div>';
            if (options.buttons && options.buttons instanceof Array && options.buttons.length > 0) {
                html += '<div class="buttons box">';
                for(var btn in options.buttons){
                    html += '<div class="button" data-click="'+btn+'">'+(options.buttons[btn].name || '按钮')+'</div>';
                }
                html += '</div>';
            }
            html += '</div></div>';
            var bufferDom = $(html);
            $("body").append(bufferDom);
            popupDom = bufferDom.children('.popup');
            if (/\.html$/.test(options.html.trim())) {
                bufferDom.find('.main').load(options.html,function(){
                    self.resize();
                    typeof(exeLoad)=="function" && exeLoad();
                });
            }else{
                bufferDom.find('.main').html(options.html);
                typeof(exeLoad)=="function" && exeLoad();
            }
            autosize(popupDom);     //居中
            self.show();            //顶层
            //绑定窗体事件
            bindEventListener(popupDom);
            $(window).bind('resize',function(){
                autosize(popupDom);
            });
            new window.UI.drag(popupDom.find('.title')[0],popupDom[0]);
        }
        function autosize(dom){
            var CHeight = document.documentElement.clientHeight,
                CWidth = document.documentElement.clientWidth,
                PHeight = dom.height(),PWidth = dom.width();
                outBoxHeight = dom.children('.title').height()*1+dom.children('.buttons').height()*1;
            dom.find(".main").css("max-height",CHeight - outBoxHeight);
            dom.css('top',CHeight>PHeight?(CHeight-PHeight)/2:0);
            dom.css('left',(CWidth-PWidth)/2);
        }
        //绑定各种事件
        var bindEventListener = function (popdom) {
            popdom.find('.title>.close').on( "click",function () {
                self.close();
            });
            popdom.find('.buttons>.button').on('click',function(e){
                var btnObj = options.buttons[e.target.dataset.click];
                btnObj && btnObj.onclick && btnObj.onclick();
            });
            //按下ESC键关闭最上层弹框
            $(document).off("keydown");
            $(document).on("keydown",function (e) {
                if (e.keyCode == 27 && $(".popup").size()) {      //按下 ESC 键
                    var topPopup = null, maxindex = -1;
                    $(".popup").each(function () {
                        if ($(this).parents(".popup-box").is(':visible') && $(this).css("z-index") >= maxindex) {
                            topPopup = $(this);
                            maxindex = topPopup.css("z-index");
                        }
                    });
                    topPopup && topPopup.find(".title>.close").trigger("click");
                }
            });
        };
        create(); //new 对象后创建窗体
    }
    window.UI = $.extend(window.UI, { prompt: prompt});
})();
//------------drag-----------
(function(){
    function drag(box,moveBox){
        moveBox = moveBox || box;
        box.onmousedown = function(e){
            var disX=e.clientX-moveBox.offsetLeft;
            var disY=e.clientY-moveBox.offsetTop;
            document.onmousemove = function(e){
                e.preventDefault();
                var l=e.clientX-disX;
                var t=e.clientY-disY;
                var ow = document.documentElement.clientWidth-moveBox.offsetWidth;
                var oh = document.documentElement.clientHeight-moveBox.offsetHeight;
                moveBox.style.left=l<0?0:(l>ow?ow:l)+'px';
                moveBox.style.top=t<0?0:(t>oh?oh:t)+'px';
                return false;
            }
            document.onmouseup = function(){
                document.onmousemove = null;    
                document.onmouseup = null;
                return false;
            }
            return false;
        }
    }
    window.UI = $.extend(window.UI, { drag:drag });
})();