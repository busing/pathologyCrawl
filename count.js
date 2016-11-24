/**
 * 统计爬取数据总量
 * 统计照片数量
 * 统计答案数量
 * cmd:node count.js
 * @type {[type]}
 */
var fs = require('fs');
var readline = require('readline');



var imageFolderName = 'images/';
var answerFolderName = 'data/';


//结果存储
var cResult = {
    imageSet: new Set(),
    answerSet: new Set(),
    maxImageId: 0
};

var fileReadOpen = 0;



/**
 * 读取图片文件
 * @param  {[type]} folderName [description]
 * @return {[type]}            [description]
 */
function readResult(folderName, type) {
    var file = fs.readdirSync(folderName);
    for (var i in file) {

        var f = folderName + '/' + file[i];
        if (f.indexOf('DS_Store') != -1) {
            continue;
        }
        if (fs.statSync(f).isDirectory()) {
            readResult(f, type);
        } else {
            if (type == 'image') {
                var fileId = file[i].substring(0, file[i].indexOf("."));
                //文件大小为0的删除
                if (fs.statSync(f).size == 0) {
                    fs.unlinkSync(f);
                    console.log('delete file :'+f)
                } else {
                    if (parseInt(fileId) > cResult.maxImageId) {
                        cResult.maxImageId = fileId;
                    }
                    getImage(fileId);
                }

            } else if (type == 'answer') {
                getAnswer(f)
            }
        }
    }
}


function getImage(f) {
    cResult.imageSet.add(f);
}

function getAnswer(f) {
    fileReadOpen++;
    var fread = fs.createReadStream(f);
    var rline = readline.createInterface({
        input: fread
    });
    rline.on('line', (line) => {
        // console.log(line);
        var answer = eval('(' + line + ')');
        if (answer.qustionId && answer.qustionId != 0) {
            cResult.answerSet.add(answer.qustionId);
        }
    });

    rline.on('close', () => {
        // console.log('readline close...');
        // console.warn('got ' + cResult.answerSet.size + ' diff answers');
        fileReadOpen--;
    });

}

function countImage() {
    readResult(imageFolderName, 'image');
    readResult(answerFolderName, 'answer');
    console.warn('got ' + cResult.imageSet.size + ' diff images');
    cResult.imageSet=new Set();
    var t = setInterval(function() {
        if (fileReadOpen == 0) {
            console.warn('got ' + cResult.answerSet.size + ' diff answers\n\n');
            clearInterval(t);
            t = null;
        }
    }, 200);
    console.log('max file id ' + cResult.maxImageId);

}

setInterval(function() {
    countImage();
}, 20000);
