var _ = require('underscore');
var stringEditDistance = require('../distance').stringEditDistance;

function groupByParent(list) {
    var index = 0;
    var result = {};
    var parents = [];

    //根据每个节点的父几点分组
    _.each(list , function(item){
        var parent = item.parent();
        var dom = parent[0];

        //console.log(parent.attr('id'));

        var i=0,find_index;
        for(i=0;i<parents.length;i++) {
            if(parents[i] == dom) {
                find_index = i;
                //console.log(parent.attr('id')+" find.");
                break;
            }
            //console.log(parents[i].attr('id')+" find.");
        }

        if(find_index===undefined) {
            find_index = index;
            parents[find_index] = dom;
            result[find_index] = [];
            index++;
        }
        result[find_index].push(item);//.text().replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s*\n\s*/g, ''));//.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s*\n\s*/g, '')
    });

    //返回最多的节点集合
    var size = 1,max_array = [];
    _.each(result , function(array){
        if(array.length>size && getLinkDensityOfList(array)<0.5) {
            size = array.length;
            max_array = array;
        }
        //console.log(array.length);
    });
    //console.log(max_array);

    return filterP(max_array);
}

//过滤段落列表的开头段落和结尾段落
function filterP(list) {
    var p_pattern = /(多精彩导购|相关链接|相关评论|相关新闻|相关专题|推荐新闻)(:|：)?/;
    //去掉开头链接密度大的段落
    while(true) {
        var dom = list.shift();
        if(!dom) {
            break;
        }

        var density = getLinkDensity(dom);
        var all_text = dom.text().replace(/\s+/g, '');
        if(density ===undefined || density>0.8 || all_text.match(p_pattern)) {
            continue;
        }
        else {
            list.unshift(dom);
            break;
        }
    }

    //去掉末尾链接密度大的段落
    while(true) {
        var dom = list.pop();
        //console.log(dom);
        if(!dom) {
            break;
        }

        var density = getLinkDensity(dom);
        var all_text = dom.text().replace(/\s+/g, '');
        if(density ===undefined || density>0.8 || all_text.match(p_pattern)) {
            continue;
        }
        else {
            list.push(dom);
            //console.log(dom);
            break;
        }
    }

    var result = [];
    _.each(list , function(dom){
        result.push(dom.text().replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s*\n\s*/g, ''));
    });
    //console.log(result);
    return result;
}

//计算一个节点的链接密度
function getLinkDensity(dom) {
    var pattern = /(\s+|>|<|\||·|,|，|-|｜|】|【)/g;
    var all_text = dom.text().replace(pattern, '');
    //console.log(all_text);

    var link_text = dom.find('a').text().replace(pattern, '');
    //console.log(link_text);
    //console.log("====================");
    if(all_text.length==0) {
        return undefined;
    }
    else {
        return getBytesLength(link_text)/getBytesLength(all_text);
    }
}

//计算一个节点的链接密度
function getLinkDensityOfList(list) {
    var total_length = 0, link_length =0;
    _.each(list, function(dom){
        var all_text = dom.text().replace(/(\s+|>|<)/g, '');
        total_length += getBytesLength(all_text);
        //console.log(all_text);

        var link_text = dom.find('a').text().replace(/(\s+|>|<)/g, '');
        link_length += getBytesLength(link_text);
    });

    if(total_length==0) {
        return undefined;
    }
    else {
        return link_length/total_length;
    }
}

function getDeep($, dom, deep) {
    deep = deep || 0;
    var children = dom.children();
    if(children.length>0) {
        var arr = _.map(children, function(child){
            return getDeep($, $(child), deep+1);
        });
        return _.max(arr)+1;
    }
    else {
        return deep+1;
    }
}

//过滤掉干扰的节点
function filterDom($) {
    var text
    while(true) {
        //过滤前的内容
        text = $('body').text();

        //去掉ul链接列表
        $('span').filter(function(index){
            var dom = $(this);
            var density = getLinkDensity($(this));
            //return $(this).text().replace(/\s/g,"")==$('a', this).text().replace(/\s/g,"");
            //console.log(density);
            //console.log($(this).html());
            //console.log('+++++++++++++++++++++');
            if(density && density==1) {
                $('a', this).insertAfter(dom);
                dom.remove();
            }
        });//.remove();

        //去掉ul链接列表
        $('table,ul,div,ol,p,span').filter(function(index){
            var dom = $(this);
            var id = dom.attr('id') || "";
            var class_name = dom.attr('class') || "";

            var tagName = dom[0].tagName;
            var text = dom.text();

            //去掉空标签
            if(text.trim().length==0) {
                return true;
            }

            //去掉特殊标签
            var reg = /(foot|footer|copyright)/i;
            if(id.match(reg) || class_name.match(reg)) {
                return true;
            }

            if(dom.find('span,div,p,td').length==0 && text.match(/All Rights? Reserved/i)) {
                return true;
            }

            if(tagName!='P' && getDeep($, dom)<=3) {
                var density = getLinkDensity(dom);
                //return $(this).text().replace(/\s/g,"")==$('a', this).text().replace(/\s/g,"");
                return (density && density>0.9);
            }

            if(isBlockList($, dom)) {
                return true;
            }

            return false;
        }).remove();

        if(text == $('body').text()) {
            break;
        }
    }
}

//验证节点是否是专题列表形式的模块
function isBlockList($, dom) {
    var all_length = dom.text().replace(/\s/g, '').length;
    var ul_list = dom.find('>ul');
    if(ul_list.length==1) {
        var ul_length = dom.find('ul').text().replace(/\s/g, '').length;
        if(all_length==0 || (all_length-ul_length)/ul_length<0.9) {
            //console.log(dom.html());
            return true;
        }
    }
    return false;
}

function getBytesLength(string) {
    return string.replace(/[^\x00-\xff]/gi, "--").length;
}

function getTitle($) {
    function _trim_title_tail(title) {
        return title.replace(/[_\|].+?$/,"").replace(/(\(\d+\))$/,"");
    }

    function _filter_dom(dom) {
        var self = $(dom);
        var id = self.attr('id') || "";
        var class_name = self.attr('class') || "";
        var pattern = /(title|main|headline|tit|text|tt|bt|h1|ReportIDname|xinlanwz)/i;
        if(self[0].tagName.match(/^h\d/i) || id.match(pattern) || class_name.match(pattern) || self.css('font-family')=='黑体' || self.css('font-weight')=='bold') {
            return true;
        }
        else if(self.find('font:first').length==1) {
            //console.log(self.find('font:first').text());
            return _filter_dom(self.find('font:first'));
        }
        else {
            return false;
        }
    }

    var list = $('h1,h2,h3,h4,h5,div,span,p,td').filter(function(index){
        return _filter_dom(this);
    })
    var dom;
    //console.log(list.length);
    var page_title = _trim_title_tail($('title').text());
    //console.log("<"+page_title+">");

    var match_list = [''];
    for(var i=0; i< list.length; i++) {
        dom = $(list[i]);

        var title = _trim_title_tail(dom.text().trim());

        //console.log(dom.html());
        //console.log("|"+title+"|");

        //判断是否是标题
        if(title.length>0 ) {
            if($('title').text().indexOf(title)>=0) {
                match_list.push(title);
            }
        }
    }

    //console.log(match_list);
    var best_title = getBestContent(match_list);//console.log('title');
    //如果用上面的方法无法匹配标题的话
    if(best_title=="") {
        return getTitle2($);
    }
    else {
        return best_title;
    }
}

function getTitle2($) {
    var page_title =$('title').text().trim();
    var distance = Number.MAX_VALUE;
    var title = "";

    $('h1,h2,h3,h4,h5,div,span,p,td').each(function(index){
        var text = $(this).text().trim();
        if(text.length>0 && text.length<=page_title.length*1.3) {
            //console.log(text);
            //console.log(page_title);

            var d = stringEditDistance(text, page_title);
            //console.log(d+'=================');
            if(d<distance) {
                distance = d;
                title = text;
            }
        }
    });
    return title;
}

function stringCount(string, pattern) {
    var match = string.match(pattern);
    if(match) {
        return match.length;
    }
    else {
        return 0;
    }
}

function getContentByList($) {
    var text_dom = undefined;
    var size = 0;
    //根据正文分析
    $("div,span,td,p").filter(function(index){
        var dom = $(this);
        var id = dom.attr('id') || "";
        var class_name = dom.attr('class') || "";
        var pattern = /(foot)/;
        //console.log(class_name);
        //return dom.text().trim().length>0;
        return $('h1,h2,h3,h4,h5,div,table', this).text().trim().length == 0 && !id.match(pattern) && !class_name.match(pattern);
    }).each(function(){
        var dom = $(this);
        //console.log('----------------------------------------');
        //console.log(dom.html());
        var density = getLinkDensity(dom);
        //console.log(dom[0].tagName + ' ' + density );
        if(density !==undefined && density<0.3) {
            //console.log(dom.html());

            var cc = stringCount(dom.html(), /<br \/>/g);
            //console.log(density);
            if(cc>size && !isBadText(dom.text().replace(/\s/g,''))) {
                text_dom = dom;
                size = cc;
            }
        }
    });

    //console.log(text_dom.html().split(/<br \/>/));
    var list = [];
    if(text_dom) {
        _.each(text_dom.html().split(/<br \/>/), function(item){
            var html = item.trim();
            if(html.length>0) {
                //console.log(html);
                list.push($('<p></p>').html(html));
            }
        })
    }
    //return [];

    return filterP(list);
}


function isBadText(text) {
    var words = [/CopyRight/i, '版权所有', 'ICP备', '许可证', '免责声明', '侵权', '责任', '电话', '稿件版权', '地址', '邮箱', '传真', '本网', '本站', '承担', '原创', '转载', '赞同其观点', '授权', '追究'];
    var arr = _.filter(words, function(word){
        return text.indexOf(word)>=0;
    });
    //console.log(arr);
    return arr.length>=6;
}

//第三种识别方式
function getContentByAttr($) {
    var text_dom = undefined;
    //根据正文分析
    $("div").each(function(){
        var dom = $(this);
        var id = dom.attr('id') || "";
        var class_name = dom.attr('class') || "";

        console.log(dom.html());
        var density = getLinkDensity(dom);
        //console.log(dom[0].tagName + ' ' + density );
        if(density !==undefined && density<0.3) {
            //console.log(dom.html());
            var size = 0;
            var cc = stringCount(dom.html(), /<br \/>/g);
            if(cc>size) {
                text_dom = dom;
                size = cc;
            }
        }
    });

    //console.log(text_dom.html().split(/<br \/>/));
    var list = [];
    if(text_dom) {
        _.each(text_dom.html().split(/<br \/>/), function(item){
            var html = item.trim();
            if(html.length>0) {
                //console.log(html);
                list.push($('<p></p>').html(html));
            }
        })
    }
    //return [];

    return filterP(list);
}

function getBestContent(list) {
    var length = 0,index=0;
    for(var i=0; i<list.length; i++) {
        if(list[i].length>length) {
            length = list[i].length;
            index = i;
        }
    }
    return list[index];
}

exports.parse = function( opt, data, cb ){
    try{
        var $ = opt.window.$;
        var out = {title:"", content:""};

        $("script,style,iframe,NOSCRIPT,input,textarea,select,label").remove();
        filterDom($, $('body'));
        //console.log($('body').html());

        /*var index = 1;
        $("body").children().each(function(){
            console.log("-----------");
            console.log(index);
            console.log($(this).html());
            index++;
        });*/

        //分析标题
        out.title = getTitle($);

        var list = [];
        $("p").each(function(){
            var dom = $(this);
            list.push(dom);
        });

        //先按照段落法分析
        var plist = groupByParent(list);
        var content1 = groupByParent(list).join("\r\n");
        var content2 = getContentByList($).join("\r\n");
        //var content3 = getContentByAttr($).join("\r\n");
        //console.log(content3);
        out.content = getBestContent([content1, content2]);
        cb( null, out );
    }catch(e){
        console.log(e);
        cb( e.toString() );
    }
};
