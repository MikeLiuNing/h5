if (typeof console == "undefined") {
    this.console = {
        log: function (msg) {
        }
    };
}
var my_cid, my_uid, my_user_type, ws;
var message_queue = [];
var user_answer;
var username;
var isFirst = true;
var vocieNextNum;

var _t_view = function () {
    return true;
}

var UserLiving = {
    teacher: {
        teacher_id: 0
    },

    // 是否正在播放
    is_playing: 0,

    // 0 直播, 1, 回放
    play_type: 0,

    // 当前播放的 message
    current_message: [],

    // 当前播放的音频对象
    current_sound: false,

    // 加载失败的对象列表
    load_errors: [],

    // 抢话筒的id
    microphone_id: 0,

    // 已回答的用户
    answered_users: [],

    // 课程状态
    course_status: 0,

    // 统计id
    t_ids: {
        'share_callback' : 10308,
        'share_timeline' : 10309,
        'share_friend'   : 10310
    },

    ui: {
        teacher_voice: $('#teacher_voice'),
        teacher_head: $('#teacher_head'),
        teacher_name: $('#teacher_name'),
        teacher_question: $('#teacher_question'),
        swiper_area: $('#swiper_area'),
        more_answer: $('#more_answer'),
        answer_container: $('#answer_container'),
        send_msg: $('#send_msg'),
        content: $('#content'),
        anchor_area: $('#anchor_area'),   // 讲师区
        anchor_message_show: $('#anchor_message_show'),   // 讲师发言显示区sss
        microphone_area: $('#microphone_area'), // 抢话筒大区域
        grab_microphone_area: $('#grab_microphone_area'), //抢话筒区域
        grab_microphone_button: $('#grab_microphone_button'), //抢话筒按钮
        grab_send_msg_area: $('#grab_send_msg_area'),    // 留言框区域
        grab_send_content: $('#grab_send_content'),    // 留言框
        grab_send_button: $('#grab_send_button'),    // 留言框发送
        hw_dialog_close_button: $('[hw_dialog_close_button]'), // 对话框关闭按钮
        answered_users_area: $('#answered_users_area'), //已回答头像区域
        anchor_area_sroll: $('#anchor_area_sroll'), //主持人聊天区域
        barrage: $('#barrage'), //弹幕区
        barrage_btn: $('#dan_btn'), //弹幕开关
        barrage_btn_line: $('#dan_btn_line'), //弹幕斜线
        in_class: $('#goto_class_btn'), //进入微课堂按钮
        show_my_friends: $('#show_my_friends'), //晒一晒按钮
        friends_show_tc: $('#friends_show_tc'),
        head_imgs_area: $('#head_imgs_area'), //朋友头像区域
        btn_share: $('#btn_share'), //诱导分享浮层
        show_area: $('#show_area'),
        tips: $('#tips'), //发言提示
        allvioce_btn: $('#allvioce_btn'), //全部音频按钮
        page_tc_voice: $('#page_tc_voice'), //全部音频弹出层
        wrapper: $('#wrapper'), //page容器id名
        online: $('#now_people'), // 在线人数
        teacher_state: $('#teacher_state'), //讲师状态
        tips_answer: $('#tips_answer'), //当前用户问题被回答提示
        stus: $('#stus'),
        swiper_pre: $('#swiper_pre'),
        swiper_next: $('#swiper_next')
    },
    tpl: {
        dialogue_other: $('#temp_dialogue_other').text(),
        dialogue_mine: $('#temp_dialogue_mine').text(),
        dialogue_stu: $('#temp_dialogue_stu').text(), //学生问题
        dialogue_teacher: $('#temp_dialogue_teacher').text(),
        dialogue_teacher_play: $('#temp_dialogue_teacher_play').text(),
        avatars: $('#avatars').text(),
        anchor_say: $('#anchor_say').text(),
        dialogue_anthor: $('#temp_dialogue_anthor').text(),
        show_friends_info: $('#show_friends_info').text()
    },
    // ws 向服务器发送数据
    wssend: function(data) {
        data = _.extend(data, {channel: this.options.chat_channel});
        if (data.type != 'pong') {
            data = _.extend(data, {token: token});
        }
        ws.send(JSON.stringify(data));
    },
    connect: function() {
        var self = this;
        // 创建websocket
        ws = new WebSocket("ws://"+document.domain+":7272");
        // 当socket连接打开时，输入用户名
        ws.onopen = function() {
            self.onopen();
        };

        // 当有消息时根据消息类型显示不同信息
        ws.onmessage = function(e) {
            self.onmessage(e);
        };

        ws.onclose = function() {
            console.log("连接关闭，定时重连");
            UserLiving.connect();
        };
        ws.onerror = function() {
            console.log("出现错误");
        };
    },

    onopen: function() {
        // 登录

        var login_data = {
            type: "login",
            cid: my_cid,
            user_type: my_user_type,
            author_id: my_uid
        };
        console.log(login_data);
        this.wssend(login_data);
    },

    onmessage: function(e) {
        //console.log(e.data);
        var data = eval("("+e.data+")");
        switch(data.type){
            // 服务端ping客户端
            case 'ping':
                this.wssend({type: "pong"});
                break;
            // 登录 更新用户列表
            case 'login':
                // data.message_id = 0;
                // data.url = '';
                // data.content = data.name + "加入了聊天室";
                // UserLiving.say(data);
                console.log(data['name']+"登录成功");
                if (isFirst) {
                    username = data['name']
                    isFirst = false;
                }
                var num = data.online_num + 1;
                UserLiving.updateOnline(num);
                break;
            // 发言
            case 'say':
                if (data.message_type == 2) {
                    data.url = data.content.url;
                    data.content = data.content.time + '"';
                }
                data.name = data.name + ' ' + data.remark;
                UserLiving.say(data);
                console.log(data);
                break;

            // 用户退出 更新用户列表
            case 'logout':
                // data.url = '';
                // data.content = data.name + "退出了聊天室";
                console.log(data['name']+"退出了聊天室");
                UserLiving.updateOnline(data.online_num);
                // UserLiving.say(data);
            case 'replyNotifyStatus':
                // console.log(data.word);
        }
    },

    updateOnline: function (num) {
        var self = this;
        var text = "当前在线人数 " + num + " 人";
        self.ui.online.text(text);
    },

    // 创建sound
    createSound: function(src) {
        var self = this;
        var sound = new buzz.sound(src, {preload: true});
        sound.bind('sourceerror', function() {
            var loaderror = _.find(self.load_errors, function(o) {
                return o.src == src;
            });
            if (loaderror) {
                loaderror.count = loaderror.count + 1;
            } else {
                loaderror = {src: src, count: 1};
                self.load_errors.push(loaderror);
            }
            // console.log(' load error' + src + ' ' + loaderror.count);

            if (loaderror.count > 3) {
                // 队列中删除
                _.remove(message_queue, function(o) {
                    return o.url == src;
                });
                if (self.current_sound == sound) {
                    self.current_sound = null;
                    // 播放下一个
                    self.is_playing = 0;
                    self.teacherVoicePlay();
                }
            } else {
                // 1s 后重新加载
                setTimeout(function () {
                    sound.load();
                }, 2000);
            }
        });

        // 处理加载失败后重新加载成功
        sound.bind('loadeddata', function () {
            if (self.current_sound == sound) {
                self.current_sound.play();
            }
        });

        // 播放结束后的调整
        sound.bind('ended', function() {
            self.is_playing = 0;
            self.current_message = [];
            self.current_sound = null;
        });
        console.log('screated ' + src);
        return sound;
    },

    say: function(data) {
        var self = this;
        if (data.user_type == 3 && data.message_type == 2) {
            // 讲师,并且是语音消息
            var html = '';
            var text = '';
            var compiled;
            if (!$.isEmptyObject(data.source_message)) {
                text = '@' + data.source_author_name + ' ' + data.source_message.content;
                var user_data = {};
                user_data.name = data.source_message.name + ' ' + data.source_message.remark;
                user_data.avatar = data.source_message.avatar;
                user_data.content = data.source_message.content;
                //compiled = _.template(self.tpl.dialogue_stu);
                //html = compiled(user_data);
                self.answered_users.push(data);
                self.avatarsRender();
            }

            var message_data = {};
            message_data.name = data.name;
            message_data.avatar = data.avatar;
            message_data.url = data.url;
            message_data.text = text;
            message_data.source_id = data.source_id;
            message_data.sound = self.createSound(data.url);
            message_queue.push(message_data);

            var teacher_data = {};
            teacher_data.name = data.name;
            teacher_data.avatar = data.avatar;
            teacher_data.url = data.url;
            teacher_data.voice_time = data.content;
            teacher_data.time = data.time.substr(11, 5);
            vocieNextNum += 1;
            teacher_data.num = vocieNextNum;
            compiled = _.template(self.tpl.dialogue_teacher_play);
            html += compiled(teacher_data);
            localStorage.setItem('voice_'+vocieNextNum, 0);
            self.ui.answer_container.append(html);

            UserLiving.teacherVoicePlay();

        } else if(data.user_type == 2) {
            // 主持人
            var text = '';
            if (!$.isEmptyObject(data.source_message)) {
                //text = '@' + data.source_author_name + ' ' + data.content;
                text = data.content;
            } else {
                text = data.content;
            }
            self.ui.anchor_message_show.text(text);

            UserLiving.addBarrage(text, '#f55232');

            compiled = _.template(self.tpl.dialogue_anthor);
            self.ui.swiper_area.append(compiled(data));

            compiled = _.template(self.tpl.anchor_say);
            self.ui.anchor_area_sroll.append(compiled(data));

        } else {
            // 普通用户
            if (data.author_id == my_uid) {
                compiled = _.template(self.tpl.dialogue_mine);
                self.ui.swiper_area.append(compiled(data));
                UserLiving.addBarrage(data.content, '#ffc067');
            } else {
                compiled = _.template(self.tpl.dialogue_other);
                self.ui.swiper_area.append(compiled(data));
                UserLiving.addBarrage(data.content, '#f58f16', '1');
            }
        }
        UserLiving.srollToEnd();
        UserLiving.srollAnthorToEnd();
    },

    teacherVoicePlay: function() {
        var self = this;
        var is_playing = this.is_playing;
        if (message_queue.length > 0 && is_playing == 0) {
            var data = message_queue.shift();
            console.log(data);

            self.ui.teacher_name.text(data.name);
            self.ui.teacher_head.attr('src', data.avatar);
            self.ui.teacher_state.hide();

            // 回复 && 跑马灯
            if (data.text && data.source_id != self.ui.teacher_question.data('source_id')) {
                var p1 = data.text.indexOf('@');
                var p2 = data.text.indexOf(' ');
                var q_name = data.text.substr(p1+1,p2-1);
                setTimeout(function () {
                    if (username == q_name) {
                        self.ui.tips_answer.show();
                        setTimeout(function () {
                            self.ui.tips_answer.hide();
                        }, 1500)
                    } else {
                        console.log('不相同');
                    }
                }, 1000);
                self.ui.teacher_question.empty();
                self.ui.teacher_question.append('<marquee id="teacher_question"  class="question" behavior="scroll" scrollamount="2">'+ data.text +'</marquee>');
                self.ui.teacher_question.data('source_id', data.source_id);
            }

            this.play_type = 1;
            this.is_playing = 1;
            this.current_message = data;
            this.current_sound = data.sound;
            this.current_sound.bind('play', function() {
                self.voiceAnimationStart();
            });
            this.current_sound.bind('ended', function() {
                if (message_queue.length > 0) {
                    self.voiceAnimationStop();
                    self.teacherVoicePlay();
                } else {
                    self.voiceAnimationStop();
                }
            });
            this.current_sound.play();
        }
    },

    otherVoicePlay: function() {
        var self = this;
        this.ui.answer_container.on('click', '[hw_voice]', function(e){
            var play_type = self.play_type;
            var is_playing = self.is_playing;
            var state = $(this).hasClass('on')? true : false;
            var voiceUrl = '';
            var data_num = $(this).attr('data_num');
            localStorage.setItem(data_num, 0);
            var $el = $(this);
            $el.siblings('.not_play').hide();
            if (is_playing == 1 && play_type == 0) {
                if (state) {
                    $el.children(".circle_2").removeClass("cricle_2");
                    $el.children(".circle_3").removeClass("cricle_3");
                    $el.removeClass('on');
                    self.current_sound.pause();
                } else {
                    self.current_sound.pause();
                    self.ui.answer_container.find('[hw_voice_animation]').removeClass("cricle_2");
                    self.ui.answer_container.find('[hw_voice_animation]').removeClass("cricle_3");
                    self.ui.answer_container.find('[hw_voice]').removeClass('on');
                    $el.children(".circle_2").addClass("cricle_2");
                    $el.children(".circle_3").addClass("cricle_3");
                    $el.addClass('on');
                    voiceUrl = $el.data('url');
                    self.current_sound = self.createSound(voiceUrl);
                    self.current_sound.bind('ended', function() {
                        $el.children(".circle_2").removeClass("cricle_2");
                        $el.children(".circle_3").removeClass("cricle_3");
                        $el.removeClass('on');
                    });
                    self.current_sound.play();
                    self.is_playing = 1;
                    self.play_type = 0;
                }
            } else {
                if (is_playing == 1 && play_type == 1) {
                    self.current_sound.pause();
                    self.voiceAnimationStop();
                }
                voiceUrl = $el.data('url');
                self.current_sound = self.createSound(voiceUrl);
                self.current_sound.bind('ended', function() {
                    $el.children(".circle_2").removeClass("cricle_2");
                    $el.children(".circle_3").removeClass("cricle_3");
                    $el.removeClass('on');
                });
                self.current_sound.play();
                self.is_playing = 1;
                self.play_type = 0;

                message_queue = [];
                $el.children(".circle_2").addClass("cricle_2");
                $el.children(".circle_3").addClass("cricle_3");
                $el.addClass('on');
            }
        });
    },

    sendMessage: function() {
        var self = this;
        this.ui.send_msg.on('click', function(){
            var content = self.ui.content.text();
            if (content && self.course_status == 2) {
                var message = {};
                message.type = 'say';
                message.cid = my_cid;
                message.author_id = my_uid;
                message.user_type = my_user_type;
                message.message_type = 1;
                message.content = content;
                message.source_id = 0;
                message.source_author_id = 0;
                self.wssend(message);
                self.ui.content.text('');
            }
        });
    },

    getUserHistory: function() {
        var self = this;
        $.ajax({
            type: "POST",
            url: "/api/message/history",
            data: {
                cid: my_cid,
                page: 1,
                message_type: 'user'
            },
            dataType: "json",
            success: function(data){
                var list = data.data.list;
                var data = {};
                var html = '';
                var compiled;
                $.each(list, function(k, v){
                    data.name = v.name;
                    data.avatar = v.avatar;
                    data.content = v.content;
                    if (v.user_id == my_uid) {
                        compiled = _.template(self.tpl.dialogue_mine);
                    } else {
                        if(v.user_type == 2){
                            compiled = _.template(self.tpl.anchor_say);
                            self.ui.anchor_area_sroll.append(compiled(data));
                        }
                        compiled = _.template(self.tpl.dialogue_other);
                    }
                    html += compiled(data);
                });
                self.ui.swiper_area.prepend(html);
            }
        });
    },

    getAnchorHistory: function() {
        var self = this;
        $.ajax({
            type: "POST",
            url: "/api/message/history",
            data: {
                cid: my_cid,
                page: 1,
                message_type: 'anchor'
            },
            dataType: "json",
            success: function(data){
                var list = data.data.list;
                var data = {};
                var compiled;
                $.each(list, function(k, v){
                    data.name = v.name;
                    data.avatar = v.avatar;
                    data.content = v.content;
                    compiled = _.template(self.tpl.anchor_say);
                    self.ui.anchor_area_sroll.append(compiled(data));
                });
            }
        });
    },

    getAnswerHistory: function(e) {
        var self = this;
        $.ajax({
            type: "POST",
            url: "/api/message/history",
            data: {
                cid: my_cid,
                page: 1,
                message_type: 'teacher_voice'
            },
            dataType: "json",
            success: function(data){
                var list = data.data.list;
                var user_data = {};
                var teacher_data = {};
                var html = '';
                var compiled;
                $.each(list, function(k, v){
                    teacher_data.name = v.name;
                    teacher_data.avatar = v.avatar;
                    if (typeof(v.content == 'object')) {
                        teacher_data.url = v.content.url;
                        teacher_data.voice_time = v.content.time + '"';
                    } else {
                        teacher_data.url = '';
                        teacher_data.voice_time = 0;
                    }
                    teacher_data.time = v.time.substr(11, 5);
                    teacher_data.num = 'voice_'+k;
                    if (!$.isEmptyObject(v.source_message)) {
                        user_data.name = v.source_message.name;
                        user_data.avatar = v.source_message.avatar;
                        user_data.content = v.source_message.content;
                        //compiled = _.template(self.tpl.dialogue_stu);
                        //html += compiled(user_data);
                        self.answered_users.push(v);
                    }
                    if (!e) {
                        localStorage.setItem('voice_'+k, 1);
                        compiled = _.template(self.tpl.dialogue_teacher);
                        html += compiled(teacher_data);
                    } else {
                        var state = localStorage.getItem('voice_'+k);
                        if (state == '1') {
                            compiled = _.template(self.tpl.dialogue_teacher);
                            html += compiled(teacher_data);
                        } else if (state == '0') {
                            compiled = _.template(self.tpl.dialogue_teacher_play);
                            html += compiled(teacher_data);
                        }
                    }
                    vocieNextNum = k;
                });
                self.ui.answer_container.prepend(html);
                self.avatarsRender();
                self.playTeacherLast(list);
            }
        });
    },

    // 将最后一条播放
    playTeacherLast: function(list) {
        if (_.last(list)) {
            var data = _.last(list);
            var text = '';
            if (!$.isEmptyObject(data.source_message)) {
                text = '@' + data.source_author_name + ' ' + data.source_message.content;
            }
            var message_data = {};
            message_data.name = data.name;
            message_data.avatar = data.avatar;
            message_data.url = data.content.url;
            message_data.text = text;
            message_data.source_id = data.source_id;
            message_data.sound = this.createSound(data.content.url);
            message_queue.push(message_data);
            this.teacherVoicePlay();
        }
    },

    initShowFriens: function () {
        var self = this;
        var description = "我的好友" ;

        $.ajax({
            type: "POST",
            url: "/api/user/friend",
            data: {
                cid: my_cid,
            },
            dataType: "json",
            success: function(data){
                var list = data.data;
                var data = {};
                var html = '';
                var compiled;
                if (list.length && localStorage.hw_is_coming != "in") {
                    self.ui.friends_show_tc.show();
                    $.each(list, function(k, v){
                        description += "@" +v.nickname + ',';
                        data.name = v.nickname;
                        data.avatar = v.avatar;
                        compiled = _.template(self.tpl.show_friends_info);
                        self.ui.head_imgs_area.append(compiled(data));
                    });
                    self.ui.show_area.show();
                    localStorage.hw_is_coming = "in";
                } else {
                    var text = '欢迎各位粑粑麻麻参加微课堂^_^!';
                    var color = '#FFF';
                    self.addBarrage(text, color);
                }
                description += "和我一起听课啦";
            },
            error: function(data){
                console.log(data);
            }
        });

        //进入微课堂
        self.ui.in_class.on('click', function () {
            self.ui.friends_show_tc.hide();
            var text = '欢迎各位粑粑麻麻参加微课堂^_^!';
            var color = '#FFF';
            self.addBarrage(text, color);
        });

        self.ui.show_my_friends.on('click', function () {
            self.ui.btn_share.removeClass('ds-n');
            self.ui.show_area.hide();
            self.ui.btn_share.on('click', function() {
                self.ui.friends_show_tc.hide();
                self.initWx();
                var text = '欢迎各位粑粑麻麻参加微课堂^_^!';
                var color = '#FFF';
                self.addBarrage(text, color);
            });
            self.initWx(description);
        });

    },

    srollToEnd: function() {
        var self = this;
        user_answer.refresh();
        var height = '-' + self.ui.swiper_area.height();
        user_answer.scrollTo(0, height);
    },

    srollSwiperToEnd: function() {
        var self = this;
        swiper_answer.refresh();
        var height = '-' + self.ui.answer_container.height();
        swiper_answer.scrollTo(0, height);
    },

    srollAnthorToEnd: function() {
        var self = this;
        anchor_area.refresh();
        var height = '-' + self.ui.anchor_area_sroll.height();
        anchor_area.scrollTo(0, height);
    },

    initUserAnswer: function () {
        //初始化用户互动发言区滑动
        user_answer = new iScroll("user_answer", {
            hScroll: false,
            hScrollbar: false,
            vScrollbar: false,
            momentum: false,
            checkDOMChanges: true
        });
    },

    initAnchorAreaSroll: function () {
        //初始化用户互动发言区滑动
        anchor_area = new iScroll("anchor_area", {
            hScroll: false,
            hScrollbar: false,
            vScrollbar: false,
            momentum: false,
            checkDOMChanges: true
        });
    },

    initVoiceArea : function () {
        swiper_answer = new iScroll("more_answer", {
            hScroll: false,
            hScrollbar: false,
            vScrollbar: false,
            momentum: false,
            checkDOMChanges: true
        });
    },

    resetSroll: function() {
        user_answer.destroy();
        UserLiving.initUserAnswer();
        UserLiving.srollToEnd();
    },

    voiceAnimationStart: function() {
        $(".dialogue").children("#circle_2").addClass("cricle_2");
        $(".dialogue").children("#circle_3").addClass("cricle_3");
    },

    voiceAnimationStop: function() {
        $(".dialogue").children("#circle_2").removeClass("cricle_2");
        $(".dialogue").children("#circle_3").removeClass("cricle_3");
    },

    //弹幕初始化
    initBarrage: function () {
        var self = this;
        self.ui.barrage.danmu({
            top: 51,
            left: 0,
            width: "100%",
            height: "30.453573%",
            speed: 20000,
            opacity: 1,
            fontSizeSmall: 16,
            FontSizeBig: 24,
        });

        self.ui.barrage.danmu('danmuStart');

        var barrageState = 1;
        self.ui.barrage_btn.on("click", function () {
            if (barrageState == 1) {
                self.ui.barrage.addClass('ds-n');
                self.ui.barrage_btn_line.removeClass('ds-n');
                barrageState = 0;
            } else if (barrageState == 0) {
                self.ui.barrage.removeClass('ds-n');
                self.ui.barrage_btn_line.addClass('ds-n');
                barrageState = 1;
            }
        });
    },

    //增加弹幕
    addBarrage: function (text, color, isNew) {
        var self = this;
        var time = self.ui.barrage.data("nowTime")+1;
        var text_obj='{ "text":"'+text+'","color":"'+color+'","size":"1","position":"0","time":'+time+'}';
        if(!isNew) {
            text_obj='{ "text":"'+text+'","color":"'+color+'","size":"1","position":"0","time":'+time+', "isnew":"1"}';
        }
        var new_obj=eval('('+text_obj+')');
        self.ui.barrage.danmu("addDanmu",new_obj);
    },

    pageInit: function() {
        var self = this;
        //初始化课件轮播区域
        $("#wrapper").height($(window).height());

        var mySwiper = new Swiper('.swiper-container', {
            autoplay: 5000,//可选选项，自动滑动
            loop: true,
        });

        self.ui.swiper_pre.on('click', function () {
            mySwiper.slidePrev();
        });

        self.ui.swiper_next.on('click', function () {
            mySwiper.slideNext();
        });

        var swiper_answer; //问答区滑动组件
        var height = $(window).height();
        var state = 1;
        var all_voice_state = 2; // 1显示 2隐藏

        //显示全部发言
        $('#allAnthor_say_btn').on("click", function () {
            _t_view(10306, '直播-显示全部发言')
            $("#page_tc_anthor").removeClass('ds-n');
            $("body").css("background", "#ffffff");
            UserLiving.srollAnthorToEnd();
            setTimeout(function () {
                $("#page_tc_anthor").animate({left:"0%"}, function () {
                    $('#tc_anthor_return').show();
                    var eheight = $('#anchor_area_sroll').height();
                    if (eheight < nowheight) {
                        $('#anchor_area_sroll').height(nowheight);
                    }
                });
            }, 100);
        });
        $('#anchor_area').on('click', function () {
            return false;
        });
        //隐藏全部发言
        $('#page_tc_anthor').on('click', function () {
            $('#tc_anthor_return').hide();
            $("#page_tc_anthor").animate({left:"110%"}, function () {
               $("body").css("background", "#ebebeb");
               $("#page_tc_anthor").addClass('ds-n');
            });
        });
        //显示全部对话
        self.ui.allvioce_btn.on("click", function () {
            _t_view(10304, '直播-显示全部对话')
            $("#page_tc_voice").removeClass('ds-n');
            //$("#wrapper").addClass('ds-n');
            UserLiving.srollSwiperToEnd();
            setTimeout(function () {
                $("#page_tc_voice").animate({left:"0%"}, function () {
                    $('#all_voice_return').show();
                    var eheight = $('#answer_container').height();
                    if (eheight < nowheight) {
                        $('#answer_container').height(nowheight);
                    }
                });
            }, 100);
        });
        $('#more_answer').on('click', function () {
            return false;
        });

        //隐藏全部对话
        $('#page_tc_voice').on('click', function () {
            $('#all_voice_return').hide();
            $("#page_tc_voice").animate({left:"110%"}, function () {
                $("#page_tc_voice").addClass('ds-n');
            });
        });

        //自动刷新到最新对话
        //每次进入页面先跳一次，然后每次用户发言，生成对话框就调用一次此函数
        setTimeout (function () {
            user_answer.scrollToElement('li:nth-last-child(1)', 100);
        }, 1000);

        // 对话框关闭
        this.ui.hw_dialog_close_button.on('click', function () {
            self.ui.hw_dialog_close_button.closest('[hw_dialog]').hide();
        });
        //当前视口高度
        nowheight = document.body.clientHeight;
        newheight = nowheight*0.9 + 'px';

        //$('#more_answer').height(newheight);
        //$('#anchor_area').height(newheight);

        //10秒主持人话语换成最新的一条
        setTimeout(function () {
            var text = $(".scroller:last").children('#anchor_message').text();
            if (text) {
                self.ui.anchor_message_show.text(text);
            }
        }, 10000);
    },

    //讲师状态改变
    teacherState: function () {
        var self = this;
        var date = new Date();
        var nowHours = date.getHours();
        var expectTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ' 21:00:00';
        expectTime = Date.parse(expectTime);
        var nowTime = date.getTime();
        if (nowTime > expectTime) {
            var waitTime = expectTime - nowTime;
            setTimeout(function () {
                self.ui.teacher_state.html('老师讲课中...');
            }, waitTime)
        }
        if (self.options.replyNotifyStatus) {
           self.ui.teacher_state.html('老师回答问题中...');
        }
    },

    //判断语音是否在本地播放过
    decideVoicePlayed: function () {
        //获取当前时间 “年月日”
        var myDate = new Date();
        var nowTime = myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate();
        //如果日期不一致  说明不是同一堂课
        if (!localStorage.hw_room_state || localStorage.hw_room_state != nowTime ) {
            localStorage.setItem('hw_is_coming','nerver');
            UserLiving.initShowFriens();
            localStorage.hw_room_state = nowTime;
            console.log(nowTime);
            UserLiving.getAnswerHistory(false);
        } else {
            UserLiving.getAnswerHistory(true);
            UserLiving.initShowFriens();
        }
    },

    //页面滑动监控
    swiperBody: function () {
        swiper_body = new iScroll("body", {
            hScroll: false,
            hScrollbar: false,
            vScrollbar: false,
            momentum: false,
            checkDOMChanges: true
        });
    },

    //分享统计
    myRecordShare: function () {
        var cid = my_cid
        $.ajax({
            type: "POST",
            url: "/api/course/share",
            data: {
                cid: cid,
                type: 2
            },
            success: function(data){
                console.log(data);
            },
            error: function(data){
                console.log(data);
            }
        });
    },

    initWx: function(sharemessage) {
        var self = this;
        var timestamp = parseInt(new Date().getTime() / 1000);
        var config = {};
        var app_id = 'wx1453c24798e5e42e';
        var req_url = encodeURIComponent(window.location.href);
        var jsApiList = ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage'];
        $.ajax({
            type: "GET",
            async: false,
            cache: false,
            url: "http://v2.shheywow.com/api/v1/weixin/jsticket/get_config?appid=" + app_id + "&url=" + req_url + "&t=" + timestamp + "&jsapilist=" + jsApiList.toString(),
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: "getJsApiTicket",
            success: function(ret) {
                if (ret.errCode == 0) {
                    config = ret.data;
                }
                config.debug = false;
                wx.config(config);
                var shareUrl = self.options.app_url + '/mobile/living?cid=' + my_cid + '&from_openid=' + self.options.openid;
                var share_title = self.options.living_share_title;
                var share_desc = self.options.living_firend_subtitle;
                var firend_title = self.options.living_firend_title;
                var img_url = self.options.living_share_picture;
                console.log('tupian  :  ' + img_url);
                if(sharemessage) {
                    share_title = sharemessage;
                    share_desc = sharemessage;
                }
                wx.ready(function(){
                    // 分享朋友圈的数据
                    wx.onMenuShareTimeline({
                        title: share_title, // 分享标题
                        link: _mz_wx_shareUrl(shareUrl), // 分享链接
                        imgUrl: img_url, // 分享图标
                        success:function() {
                            if(!sharemessage) {
                                $('#tc_share').addClass('ds-n');
                                //Record.timeline(page_name);
                                _t_view(self.t_ids.share_timeline, '直播-分享朋友圈')
                                self.shareCallback();
                            } else {
                                self.ui.friends_show_tc.hide();
                                var text = '欢迎各位粑粑麻麻参加微课堂^_^!';
                                var color = '#FFF';
                                self.addBarrage(text, color);
                                self.initWx();
                            }
                            UserLiving.myRecordShare();
                        }
                    });

                    // 分享给好友的数据
                    wx.onMenuShareAppMessage({
                        title: firend_title, // 分享标题
                        desc: share_desc, // 分享描述
                        link: _mz_wx_shareUrl(shareUrl), // 分享链接
                        imgUrl: img_url, // 分享图标
                        type: '', // 分享类型,music、video或link，不填默认为link
                        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        success:function() {
                            if(!sharemessage){
                                $('#tc_share').addClass('ds-n');
                                //Record.friend(page_name);
                                _t_view(self.t_ids.share_friend, '直播-分享好友');
                                self.shareCallback();
                            } else {
                                self.ui.friends_show_tc.hide();
                                var text = '欢迎各位粑粑麻麻参加微课堂^_^!';
                                var color = '#FFF';
                                self.addBarrage(text, color);
                                self.initWx();
                            }
                            UserLiving.myRecordShare();
                        }
                    });
                });
            }
        });
    },


    // 初始化抢话筒事件
    initGrab: function() {
        var self = this;
        // 中间抢话筒事件
        this.ui.grab_microphone_button.on('click', function () {
            _t_view(10301, '直播-抢话筒')
            $.ajax({
                type: "POST",
                url: "/api/message/grab_microphone",
                data: {
                    cid: my_cid,
                    uid: my_uid
                },
                dataType: "json",
                success: function(data){
                    if (!data.status) {
                        self.showGrabNot(0);
                    }
                    if (data.data.grab_state != 1) {
                        self.showGrabNot(data.data);
                    } else {
                        self.showGrabYes(data.data);
                    }
                }
            });
        });

        // 发言框 发送
        this.ui.grab_send_button.on('click', function () {
            var content = self.ui.grab_send_content.text();
            if (content && self.microphone_id) {
                var message = {};
                message.type = 'say';
                message.cid = my_cid;
                message.author_id = my_uid;
                message.user_type = my_user_type;
                message.message_type = 1;
                message.content = content;
                message.microphone_id = self.microphone_id;
                message.source_id = 0;
                message.source_author_id = 0;
                self.wssend(message);
                self.ui.content.text('');

                self.microphone_id = 0;
                self.ui.tips.show();
                setTimeout(function () {
                    self.ui.tips.hide();
                    self.ui.grab_send_button.closest("[hw_dialog]").hide();
                    window.scrollTo(0, 0);
                }, 3000);
            }

        });
    },

    // 显示没抢到
    showGrabNot: function (data) {
        if (data.grab_state == 2) {
            $('#tc_share').removeClass('ds-n');
        } else {
            $('#tc_failed').removeClass('ds-n');
        }
    },

    //随意点击一下，没抢到浮层消失
    grabFailedHide: function () {
        $('#tc_failed').on('click', function () {
            $('#tc_failed').addClass('ds-n');
        });
    },
    //随意点击一下，分享提示浮层消失
    grabShareHide: function () {
        $('#tc_share').on('click', function () {
            $('#tc_share').addClass('ds-n');
        });
    },

    // 显示抢到
    showGrabYes: function (data) {
        // 显示发言对话框
        this.microphone_id = data.microphone_id;
        this.ui.grab_send_content.text('');
        this.ui.grab_send_msg_area.show();
    },

    // 分享回调
    shareCallback: function () {
        var self = this;
        _t_view(self.t_ids.share_callback, '直播-分享回调')
        $.ajax({
            type: "POST",
            url: "/api/message/share",
            data: {
                cid: my_cid,
                uid: my_uid
            },
            dataType: "json",
            success: function(data){
                if (!data.status) {
                    self.showGrabNot(0);
                }
                if (data.data.grab_state != 1) {
                    self.showGrabNot(data.data);
                } else {
                    self.showGrabYes(data.data);
                }
            }
        });
    },

    // 头像区域render
    avatarsRender: function() {
        //var answered_users = _.slice(this.answered_users, 0, 20);
        var answered_users = this.answered_users;
        var self = this;
        var all_num = 20;
        var answered_left;
        var avatars_html = '';

        var i = 0;
        var j = 0;
        _.each(answered_users, function (message) {
            //console.log(answered_users[i].source_author_avatar);
            if (i-1 > 0 && (answered_users[i-1].source_author_avatar != answered_users[i].source_author_avatar)) {
                var avatar_img_src = message.source_message.avatar;
                avatars_html = avatars_html + '<div class="stu"><img src="' + avatar_img_src + '"></div>';
                j += 1;
            } else if (i == 0) {
                var avatar_img_src = message.source_message.avatar;
                avatars_html = avatars_html + '<div class="stu"><img src="' + avatar_img_src + '"></div>';
                j += 1;
            }
            i++;
        });

        answered_left = all_num - j;
        if (answered_left <= 0) {
            answered_left = 0;
            j = 20;
        }
        for (var i = 0; i < answered_left; i++) {
            avatars_html = avatars_html + '<div class="stu"></div>';
        };
        var data = {
            answered_num: j,
            answered_left: answered_left,
            avatars: avatars_html
        };

        var compiled = _.template(this.tpl.avatars);
        this.ui.answered_users_area.html(compiled(data));

    },

    init: function(options) {
        var self = this;

        my_uid = options.uid;
        my_cid = options.cid;
        my_user_type = options.user_type;
        this.options = options;
        self.course_status = options.status;

        UserLiving.decideVoicePlayed();
        UserLiving.initWx();
        UserLiving.initUserAnswer();
        UserLiving.initAnchorAreaSroll();
        UserLiving.initVoiceArea();
        UserLiving.connect();
        UserLiving.otherVoicePlay();
        UserLiving.pageInit();
        UserLiving.sendMessage();
        //UserLiving.getUserHistory();
        UserLiving.getAnchorHistory();
        //UserLiving.getAnswerHistory();
        UserLiving.initGrab();
        UserLiving.grabShareHide();
        UserLiving.grabFailedHide();
        UserLiving.teacherState();
        UserLiving.initBarrage();
        //UserLiving.swiperBody();
        //UserLiving.initShowFriens();
    }
};