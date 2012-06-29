exports.list = {
    //name:'新浪滚动-财经'
    //url:'http://roll.finance.sina.com.cn/s/channel.php?ch=03#col=43&spec=&type=&ch=03&k=&offset_page=0&offset_num=0&num=60&asc=&page=1',
    "sina.list_roll" : {
        path:'#d_list .c_tit a'
    },


    "qq.list1":{
        path:".newslist a"
    },


    "xinhua08.list":{
        path:"ul.unilist li a",
        url_filter:function(url, date){
            var pattern = new RegExp(date+'\\/\\d+\\.shtml$');
            //pattern = /20120313\/\d+\.shtml$/;
            //console.log('/'+date+'\\/\\d+\\.shtml$/');
            if(url.match(pattern)!=null) {
                //console.log(url);
                //console.log(date);
                return true;
            }
            else {
                return false;
            }
        }
    }
};