/**
 * 工具类
 * 文件行读取
 * trim
 * 注射jquery js
 */

var fs = require('fs')
var readline = require('readline');

//注入jquery文件
function injectJQuery() {
    document.write("<script src='http://libs.baidu.com/jquery/1.9.1/jquery.min.js'></script>");
    String.prototype.trim = function() {
        return this.replace(/\s*/g, "");
    }
}

function fileReadLine(f, lineCall, closeCall) {
    var fread = fs.createReadStream(f);
    var rline = readline.createInterface({
        input: fread
    });
    rline.on('line', (line) => {
        if (lineCall) {
            lineCall(line);
        }
    });

    rline.on('close', () => {
        if (closeCall) {
            closeCall();
        }

    });

}

//String trim 方法
String.prototype.trim = function() {
    // 用正则表达式将前后空格  
    // 用空字符串替代。  
    return this.replace(/\s*/g, "");
}


//模块导出方法
module.exports.injectJQuery = injectJQuery;
module.exports.fileReadLine = fileReadLine;


