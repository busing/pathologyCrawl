/**
 * cmd:casperjs index.js --config=<(echo '{"sslProtocol": "any"}') --ignore-ssl-errors=true
 */

var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    waitTimeout: 1000 * 10,
    pageSettings: {
        loadImages: true
    }
});

//casperjs 不使用nodejs的运行环境，使用的是phantomjs的运行环境，这里的fs是phantomjs的fs
//http://phantomjs.org/api/fs/
var fs = require('fs');
var system = require('system');
var utils = require("./utils.js");
var tools = require('utils');

var account = {
    username: 'jsy774514072@gmail.com',
    password: 'jsy19920106'
    // username: '664732852@qq.com',
    // password: '123456789520wft'
}

var url = {
    login: 'https://pcs-webtest0.pathology.washington.edu/academics/pattern/dev/',
    begin: 'https://pcs-webtest0.pathology.washington.edu/academics/pattern/dev/begin'
}

// var url="https://www.baidu.com/";


casper.start(url.login, function() {
    this.echo(this.getTitle(), 'GREEN_BAR');
}).thenEvaluate(function() {
    //选择gmail 登录
    $(".list-group-item").eq(1).find("input").click();
    $("input[type='submit']").click();
}).then(function() {
    this.fill('form#gaia_loginform', {
        Email: account.username
    }, false);
    casper.capture(getFileName('capture') + 'fillemail.jpg');
    this.click('#next');
});


//等待密码框
casper.waitForSelector("#Passwd", function() {
    this.fill('form#gaia_loginform', {
        Passwd: account.password
    }, false);
    this.click('#signIn');
    this.wait(20000, function() {
        this.capture(getFileName('capture') + 'fillpassword.jpg');
    });
});

//进入开始测试界面
casper.thenOpen(url.begin, function() {
    this.capture(getFileName('capture') + "beigintest.jpg")
});

casper.then(function() {
    //开始训练 阶段结束  现在不显示答案
    // casper.waitForSelector("select[name='traininglevel']", function() {
    casper.waitForSelector(".btn-primary", function() {

        this.click(".btn-primary");
        this.echo('click btn-primary', 'GREEN_BAR');
    }, function() {
        this.echo('wait for traininglevel timeout', 'RED_BAR');
    }, 10000);
});


casper.then(function() {
    //检测QustionID
    casper.waitForSelector("input[name='QuestionID']", function() {
        this.echo('get qustionId', 'GREEN_BAR');
        this.capture(getFileName('capture') + "qustionId.jpg")

        var qustionId = this.evaluate(function() {
            return __utils__.getFieldValue("input[name='QuestionID']");
        });

        doNext(this, qustionId);
    }, function() {
        this.echo('wait for QuestionID timeout', 'RED_BAR');
    }, 10000);

});

var i = 0;
var preAnswerId;

function doNext(casper, qustionId) {
    casper.echo('qustionId:' + qustionId, 'GREEN_BAR');
    casper.wait(5000, function() {
        var buttonText = casper.getHTML('#nextimage');

        if (qustionId != 0) {
            //下载图片 回答问题界面
            casper.download("https://pcs-webtest0.pathology.washington.edu/academics/pattern/dev/file?id=" + qustionId,
                getFileName('images') + qustionId + ".jpeg");
            //回答问题界面
            //选择答案
            casper.click("input[name='answer']");

            //问题答案界面
            if (qustionId == preAnswerId) {
                //record correct answer
                casper.capture(getFileName('capture') + qustionId + "_answer.jpg");
            } else {
                casper.capture(getFileName('capture') + qustionId + "_qustion.jpg");
            }
            var answerInfo = casper.evaluate(getAnswerInfo);
            casper.echo(answerInfo, 'GREEN_BAR');
            appendAnswer(answerInfo + "\n");
        }

        casper.click('#nextimage');
        i++;
        preAnswerId = qustionId;
        qustionId = casper.evaluateSync(function() {
            return __utils__.getFieldValue("input[name='QuestionID']");
        });
        //递归回调
        doNext(casper, qustionId);
    });
}


//获取答案信息
function getAnswerInfo() {
    var module=$('#moduletab').find('.dropdown-toggle').text().trim();
    var processInfo=$('.panel-heading').find('h3').text().trim();
    var qustionId = $("input[name='QuestionID']").val();
    var answerInfo = {
        module:module,
        processInfo:processInfo,
        qustionId: qustionId,
        answerList: []
    };
    $.each($(".radio label"), function(i, n) {
        var name = $(this).text().trim();
        var value = $(this).find("input[type='radio']").val();
        //正确答案
        if ($(this).find('span').eq(0).hasClass('label-success')) {
            answerInfo.answer = value;
        }
        answerInfo.answerList.push({
            name: name,
            value: value
        });
    });
    return JSON.stringify(answerInfo);
}



//追加答案到文件
function appendAnswer(data) {
    //记录数据到文件
    var fileName = getFileName('data') + 'answerInfo.txt';
    console.log("append to file " + fileName);
    fs.write(fileName, data, 'a');
}


function getFileName(path) {
    var oDate = new Date(); //实例一个时间对象；
    var dateName = "";
    dateName += oDate.getFullYear(); //获取系统的年；
    dateName += oDate.getMonth() + 1; //获取系统月份，由于月份是从0开始计算，所以要加1
    dateName += oDate.getDate(); // 获取系统日，

    var fileName = path + '/' + dateName + '/';

    if (!fs.isDirectory(fileName)) {
        fs.makeDirectory(fileName);
        console.log('create folder:' + fileName)
    }
    return fileName;
}


casper.run();
