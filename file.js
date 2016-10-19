

var fs = require('fs');
var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    waitTimeout: 1000 * 10,
    pageSettings: {
        loadImages: true
    }
});




casper.start('http://www.baidu.com', function() {
    this.echo(this.getTitle(), 'GREEN_BAR');
    appendAnswer(this.getTitle());
});

//追加答案到文件
function appendAnswer(data) {
    var oDate = new Date(); //实例一个时间对象；
    var fileName = "";
    fileName += oDate.getFullYear(); //获取系统的年；
    fileName += oDate.getMonth() + 1; //获取系统月份，由于月份是从0开始计算，所以要加1
    fileName += oDate.getDate(); // 获取系统日，


    //记录数据到文件
    var fileName = 'data/' + fileName + '_answer.txt';
    console.log("write to file " + fileName);
    console.log(fs);


    fs.write(fileName, data, 'w');
}


casper.run();
