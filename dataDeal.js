/**
 * 数据处理
 * 处理爬取的数据
 * 生成最终问题和答案数据
 * pathology_train.txt
 * cmd:node dataDeal.js
 */

var fs = require('fs');
var utils = require('./utils.js');
var imageFolderName = 'images/';
var answerFolderName = 'data/';
var resultFolderName = 'result/';
var qustion_info = {};
var qustion_answer = {};
var openFile = 0;
var noOptions = 0;
var noAnswerId = 0;
var notFountQustion = 0;
var noAnswerIdButOptions = 0;



function readModule() {
    var file = fs.readdirSync(resultFolderName);
    for (var i in file) {
        var f = resultFolderName + '/' + file[i];
        openFile++;
        utils.fileReadLine(f, function(line) {
            var strArr = line.split(":");
            var qustionId = strArr[0].split("-")[1];
            var answer = strArr[1];
            qustion_info[qustionId] = {
                qustionId: qustionId,
                module: file[i].replace('-', ' '),
                answer: answer
            };
        }, function() {
            // console.log(qustion_info);
            openFile--;
            if (openFile == 0) {
                readQustionAndAnswer(answerFolderName);
            }
        });
    }
}


function readQustionAndAnswer(folderName) {

    var file = fs.readdirSync(folderName);
    for (var i in file) {
        var f = folderName + '/' + file[i];
        if (f.indexOf('DS_Store') != -1) {
            continue;
        }
        if (fs.statSync(f).isDirectory()) {
            readQustionAndAnswer(f);
        } else {
            openFile++;

            utils.fileReadLine(f, function(line) {
                var answer = eval('(' + line + ')');
                var qustion = qustion_info[answer.qustionId];
                if (qustion) {
                    if (answer.answerList != undefined) {
                        qustion.options = answer.answerList;
                    } else {
                        noOptions++;
                    }

                    if (answer.answer != undefined) {
                        qustion.answerId = answer.answer;
                    } else {
                        for (var i in (answer.answerList == undefined ? [] : answer.answerList)) {
                            if (qustion.answer == answer.answerList[i].name) {
                                qustion.answerId = answer.answerList[i].value;
                            } else if (answer.answerList[i].name.indexOf(qustion.answer) != -1) {
                                qustion.answerId = answer.answerList[i].value;
                            }
                        }
                        if (qustion.answerId == undefined || qustion.answerId == '') {
                            // console.log(qustion)
                            // console.log(qustion_info[answer.qustionId])

                        }
                    }
                    qustion_info[answer.qustionId] = qustion;

                } else {
                    notFountQustion++;
                }
            }, function() {
                openFile--;
                if (openFile == 0) {
                    setTimeout(function() {
                        console.log("--------------")
                        for (var i in qustion_info) {
                            if (qustion_info[i].answerId == undefined) {
                                noAnswerId++;
                            }
                            if (qustion_info[i].answerId == undefined && qustion_info[i].options != undefined) {
                                noAnswerIdButOptions++;
                            }

                        }
                        console.log("noOptions:" + noOptions);
                        console.log("noAnswerId:" + noAnswerId);
                        console.log("noAnswerIdButOptions:" + noAnswerIdButOptions);
                        console.log("notFountQustion:" + notFountQustion);


                        for (var i in qustion_info) {
                            fs.appendFile('./patholog_train.txt', JSON.stringify(qustion_info[i])+"\n", 'utf8');
                        }

                    }, 2000);

                }
            });
        }
    }
}

readModule();
