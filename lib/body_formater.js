process.on('uncaughtException', function(e){
    console.log(['uncaughtException:', e]);
});

exports.BodyFormater = function(content) {
    var _self = this;

    _self.toString = function() {
        return content;
    }

    _self.format = function() {
        //console.log(content);
        try {
        //处理换行
        content = content.replace(/\r/gm, '').replace(/\n\s+/gm,"\n");
        //console.log(content)

        //处理段落
        //content = content.replace(/(<\/p>|<br *\/?>)/igm, "\n");//
        //console.log(content)
        //content = content.replace(/(<p>|<p\s*[^>]*?>)/igm, "");
        //console.log(content);
        content = content.replace(/\n\s+/gm,"\n").trim().replace(/\n+/gmi,"\r\n");
        return _self;
    }catch(e) {
        console.log(e);
    }
    }
}