<?php
    require_once "jssdk.php";
    $jssdk = new JSSDK("wx1453c24798e5e42e", "23814ac0b77eba25eed71b235ccae443");
    $signPackage = $jssdk->GetSignPackage();
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" /> <!-- 禁止把数字转化为拨号链接 -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black" /> 
    <meta http-equiv="Pragma" content="no-cache">
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <link rel="stylesheet" type="text/css" href="css/page.css">
    <script>
        var phoneWidth = parseInt(window.screen.width);
        var phoneScale = phoneWidth/640;
    

        var ua = navigator.userAgent;
        if (/Android (\d+\.\d+)/.test(ua)){
            var version = parseFloat(RegExp.$1);
            // andriod 2.3
            if(version>2.3){
                document.write('<meta name="viewport" content="width=640, minimum-scale = '+phoneScale+', maximum-scale = '+phoneScale+', target-densitydpi=device-dpi">');
            // andriod 2.3以上
            }else{
                document.write('<meta name="viewport" content="width=640, target-densitydpi=device-dpi">');
            }
            // 其他系统
        } else {
            document.write('<meta name="viewport" content="width=640, user-scalable=no, target-densitydpi=device-dpi">');   
        }
    </script>
    <script>
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "//hm.baidu.com/hm.js?e27235ca3eceac2139735ae592c9201a";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
    </script>

    <title>有试吗</title>
</head>
<body>
    <!--背景页-->
    <section class="background-page" id="background-page">
    </section>
    <!--预热页-->
    <section class="loading-page" id="loading-page">
        <div class="light"></div>
        <div class="title-1"></div>
        <div class="title-2"></div>
        <div class="title-3"></div>
    </section>
    <!--首页-->
    <section class="first-page ds-n op-0" id="first-page">
        <div class="have-try"><img src="./img/havetry.png"></div>
        <div class="prize-car"></div>
        <div class="prize-ring"></div>
        <div class="prize-bicycle"></div>
        <div class="prize-travel"></div>
        <div class="prize-others"><img src="./img/prize_others.png"></div>
        <div class="start-btn" id="start-btn"><img src="./img/start_btn.png"></div>
        <div class="first-hand"><img src="./img/hand.png"></div>
    </section>
    <!--问题页-->
    <section class="question ds-n" id="question-page">
        <div class="question-title op-0"><img id="question-img" src="./img/question_1.png"></div>
        <div class="answer-a answer op-0" value='a'><div>三体</div></div>
        <div class="answer-b answer op-0" value='b'><div>北京遇上西雅图</div></div>
        <div class="answer-c answer op-0" value='c'><div>小时代</div></div>
        <div class="answer-d answer op-0" value='d'><div>复仇者联盟</div></div>
        <div class="surebtn op-0" id="surebtn"><img src="./img/surebtn.png"></div>
    </section>
    <!--结果页-->
    <section class="result ds-n" id="result-page">
        <div class="content op-0"><img id="result-img" src="./img/lifestyle.png"></div>
        <a class="banner op-0" href="http://weixin.liketry.com/goods-detail/index?product_id=40101298"><img src="./img/clickme.png"></a>
        <div class="sharebtn op-0"><img src="./img/share_btn.png"></div>
        <div class="trybtn op-0"><img src="./img/try_do.png"></div>
    </section>
    <!--奖品页-->
    <section class="prizes ds-n" id="prize-page">
        <div class="return-btn"><img src="./img/return.png"></div>
        <div class="prize-text"><img src="./img/prize_week.png"></div>
        <a class="prize-3 prize-week-biycle" href="http://mp.weixin.qq.com/s?__biz=MjM5NTE2MjY2MA==&mid=504414053&idx=1&sn=7b2821c5870efae18848605e8bf06296#rd"><img src="./img/prize_week_1.png"></a>
        <a class="prize-week prize-week-car" href="http://mp.weixin.qq.com/s?__biz=MjM5NTE2MjY2MA==&mid=2651898055&idx=1&sn=7cc00d1b061cd47097bee9fa1a85a778#rd"><img src="./img/prize-week-biycle.png"></a>
        <a class="prize-1 prize-week-ring" href="#"><img src="./img/prize-week-ring.png"></a>
        <a class="prize-2 prize-week-travel" href="#"><img src="./img/prize-week-travel.png"></a>
        <div class="have-try"><img src="./img/havetry.png"></div>
    </section>
    <!--分享诱导浮层-->
    <section class="share ds-n" id="share-page">
        <img src="./img/share_float_text.png">
    </section>
    <!--提示-->
    <section class="dialog-alert ds-n">
        <div class="dialog">
            请选择您的答案
        </div>
    </section>
<script src="js/jquery.min.js"></script>
<script src="js/easyBackground-min.js"></script>
<script src="js/page.js"></script>
<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
<script type="text/javascript">
    wx.config({
        debug: false, 
        appId: '<?php echo $signPackage["appId"];?>',
        timestamp: <?php echo $signPackage["timestamp"];?>,
        nonceStr: '<?php echo $signPackage["nonceStr"];?>',
        signature: '<?php echo $signPackage["signature"];?>',
        jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage'
        ]
    });
</script>
<script type="text/javascript">
    $(document).ready(function() {
        $('#background-page').easyBackground({
            wrapNeighbours: false
        });
        Page.init();
        if (/Android (\d+\.\d+)/.test(ua)){
            if(window.screen.width < 360){
                $('.title-2').css('top', '12.9rem');
                $('.title-3').css('top', '27.9rem');
                $('.question-title').css('margin-bottom', '2rem');
                $('.surebtn').css('margin-top', '32rem');
                $('#result-img').css('margin-top', '-5rem');
                $('.sharebtn').css('margin-top', '2rem');
                $('.trybtn').css('margin-top', '2rem');
                $('.answer').css('height', '10rem')
            }
        }
    });
</script>
</body>
</html>
