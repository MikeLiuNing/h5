var questionState = 1;
var choice = null;

var Page = {
    pageInit: function() {
        var self = this;

        $('.title-1').addClass('move-1');
        $('.title-2').addClass('move-2');
        $('.title-3').addClass('move-3');
        $('#loading-page').addClass('fadein-1');

        setTimeout(function() {
            $('#loading-page').addClass('ds-n');
            $('#first-page').removeClass('ds-n');
            $('#first-page').addClass('show-scale')
            setTimeout(function() {
                $('.prize-car').addClass('blink-1');
                $('.prize-ring').addClass('blink-2');
            }, 100);
            setTimeout(function() {
                $('.prize-bicycle').addClass('blink-1');
                $('.prize-travel').addClass('blink-2');
            }, 500)
        }, 4100);
        
        $('#start-btn').on('click', function() {
            _hmt.push(['_trackEvent', 'start-btn', 'click', 'click']);
            $('#first-page').addClass('ds-n');
            $('#question-page').removeClass('ds-n');
            self.showQuestions();
        })
        $('.sharebtn').on('click', function() {
            $('#share-page').removeClass('ds-n');
        });
        $('#share-page').on('click', function() {
            $(this).addClass('ds-n');
        });
        $('.trybtn').on('click', function() {
            $('#result-page').addClass('ds-n');
            $('#prize-page').removeClass('ds-n');
            _hmt.push(['_trackEvent', 'try-btn', 'click', 'click']);
        });
        $('.return-btn').on('click', function() {
            $('#prize-page').addClass('ds-n');
            $('#result-page').removeClass('ds-n');
            _hmt.push(['_trackEvent', 'return-btn', 'click', 'click']);
        });
        $('.prize-week-biycle').on('click', function() {
            _hmt.push(['_trackEvent', 'prize-week-biycle', 'click', 'click']);
        });
        $('.prize-week-car').on('click', function() {
            _hmt.push(['_trackEvent', 'prize-week-car', 'click', 'click']);
        });
        $('.prize-week-ring').on('click', function() {
            _hmt.push(['_trackEvent', 'prize-week-ring', 'click', 'click']);
        });
        $('.prize-week-travel').on('click', function() {
            _hmt.push(['_trackEvent', 'prize-week-travel', 'click', 'click']);
        });
    },

    changeQuestion: function() {
        var self = this;
        $('#surebtn').on('click', function() {
            if (choice == null) {
                $('.dialog-alert').removeClass('ds-n');
                setTimeout(function() {
                    $('.dialog-alert').addClass('ds-n');
                }, 1000);
            } else {
                self.resetAnswer();
                if(questionState == 1) {
                     _hmt.push(['_trackEvent', 'question-page-1', 'click', 'click']);
                    $('#question-page').addClass('turn2');
                    setTimeout(function() {
                        self.showQuestions();
                        $('#question-page').removeClass('turn2');
                    }, 1100);
                    setTimeout(function() {
                        self.resetQuestion();
                    }, 1000);
                    setTimeout(function () {
                        $('.answer-a').children('div').text('造个专属机器人');
                        $('.answer-b').children('div').text('买辆房车环游世界');
                        $('.answer-c').children('div').text('练出A4腰iphone6腿');
                        $('.answer-d').children('div').text('重新改造自己的家');
                        $('#question-img').attr('src', './img/question_2.png');
                    }, 1000)
                    questionState = 2
                } else if (questionState == 2) {
                    _hmt.push(['_trackEvent', 'question-page-2', 'click', 'click']);
                    $('#question-page').addClass('turn2');
                    setTimeout(function() {
                        self.showQuestions();
                        $('#question-page').removeClass('turn2');
                    }, 1100);
                    setTimeout(function() {
                        self.resetQuestion();
                    }, 1000);
                    setTimeout(function () {
                        $('.answer-a').children('div').text('超强大脑');
                        $('.answer-b').children('div').text('自由飞翔');
                        $('.answer-c').children('div').text('逆天颜值');
                        $('.answer-d').children('div').text('传播正能量');
                        $('#question-img').attr('src', './img/question_3.png');
                    }, 1000);
                    questionState = 3
                } else if (questionState == 3) {
                    _hmt.push(['_trackEvent', 'question-page-3', 'click', 'click']);                
                    $('#question-page').addClass('turn2');
                    setTimeout(function() {
                        self.showResult();
                        $('#question-page').addClass('ds-n');
                        $('#result-page').removeClass('ds-n');
                        self.choiceResult();
                    }, 1100);
                    setTimeout(function() {
                        self.resetQuestion();
                    }, 1000);
                    
                }
            }
        });
    },

    showQuestions: function() {
        choice = null;
        $('.question-title').removeClass('op-0')
        $('.question-title').addClass('show');
        setTimeout(function() {
            $('.answer').removeClass('op-0');
            $('.answer').addClass('show');
            setTimeout(function() {
                $('#surebtn').removeClass('op-0');
                $('#surebtn').addClass('show')
            }, 1000);
        }, 1000);
    },

    resetQuestion: function() {
        $('.question-title').addClass('op-0');
        $('.question-title').removeClass('show');
        $('.answer').addClass('op-0');
        $('.answer').removeClass('show');
        $('#surebtn').addClass('op-0');
        $('#surebtn').removeClass('show');
    },

    choiceAnswer: function() {
        var self = this;
        $('.answer-a').on('click', function() {
            self.resetAnswer();
            $(this).addClass('dep-answer-a');
            choice = $(this).attr('value');
        });
        $('.answer-b').on('click', function() {
            self.resetAnswer();
            $(this).addClass('dep-answer-b');
            choice = $(this).attr('value');
        });
        $('.answer-c').on('click', function() {
            self.resetAnswer();
            $(this).addClass('dep-answer-c');
            choice = $(this).attr('value');
        });
        $('.answer-d').on('click', function() {
            self.resetAnswer();
            $(this).addClass('dep-answer-d');
            choice = $(this).attr('value');
        });
    },

    resetAnswer: function() {
        $('.answer-a').removeClass('dep-answer-a');
        $('.answer-b').removeClass('dep-answer-b');
        $('.answer-c').removeClass('dep-answer-c');
        $('.answer-d').removeClass('dep-answer-d');
    },

    choiceResult: function() {
        if (choice == 'a') {
            $('#result-img').attr('src', './img/future.png');
        } else if (choice == 'b') {
            $('#result-img').attr('src', './img/move.png');
        } else if (choice == 'c') {
            $('#result-img').attr('src', './img/lifestyle.png');
        } else if (choice == 'd') {
            $('#result-img').attr('src', './img/beauty.png');
        }
    },

    showResult: function() {
        $('.content').addClass('show');
        setTimeout(function() {
            $('.banner').addClass('show');
            $('.sharebtn').addClass('show');
            $('.trybtn').addClass('show');
            $('.banner').removeClass('op-0');
            $('.banner').addClass('shake')
        }, 1000);
    },

    wx: function() {
        var title = "这里，全都是好试儿，有事没事都来试试吧！";
        var link = 'http://liketry.sites.shheywow.com/app1/';
        var imgUrl = 'http://liketry.sites.shheywow.com/app1/img/share.png'
        var desc = '海量试品，全新体验，尽在「有试吗」。';
        desc = desc || title
        wx.ready(function(){
            wx.onMenuShareTimeline({
                title: title, // 分享标题
                link: link, // 分享链接
                imgUrl: imgUrl, // 分享图标
                success: function () { 
                   _hmt.push(['_trackEvent', 'wx_share_timeline', 'share', link]);
                }
            });
            wx.onMenuShareAppMessage({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: link, // 分享链接
                imgUrl: imgUrl, // 分享图标
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function () { 
                    _hmt.push(['_trackEvent', 'wx_share_friends', 'share', link]);
                }
            });
        });
    },

    init: function () {
        this.pageInit();
        this.changeQuestion();
        this.choiceAnswer();
        this.wx();
    }
}