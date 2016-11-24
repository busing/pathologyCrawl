
/**
 * nero模块训练完毕
 * 获取所有问题答案选项
 * 浏览器结果页面执行
 */
$('.table-striped').find('tr').each(function(){
var $td=$(this).find('td');
var $abbr=$td.eq(3);
var answer=($abbr.find('abbr').attr('title')==undefined?$abbr.text():$abbr.find('abbr').attr('title'));
console.log($td.eq(0).find('div').attr('id')+":"+answer);
});