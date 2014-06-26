/*
  1.源文件目录 sourceDir
  2.编译目标目录 outPutPath
  3.js debug目录 debugFilePath
  4.支持require闭包，将每个模板压缩成一个闭包文件
*/

var soyUtilFilePath = "../../lib/soyutils.js";
var soyToJsSrcCompilerPath =   "../../lib/SoyToJsSrcCompiler.jar";
var spawn = require('child_process').spawn,path = require('path');
var libPath = path.resolve(module.filename,soyToJsSrcCompilerPath);
var compileLibPath = path.resolve(module.filename,"../../lib/compiler.jar");
var compileExternsPath = path.resolve(module.filename,"../../lib/externs.js");
var compileOutputPath = "../workspace/templateFront.min.js";
var jsLibPath = path.resolve(module.filename,soyUtilFilePath);
var buidTemplatePath = "build/template/template.js";
var debugTemplateFrontPath = "../workspace/templateFront.debug.js";
var jsOutPutHeadPath=path.resolve(module.filename,"../../lib/jsOutPutHead.js") ;
var jsOutPutFootPath=path.resolve(module.filename,"../../lib/jsOutPutFoot.js") ;
var templateModuleExportHeadPath =  path.resolve(module.filename,"../../lib/soyNodeTemplate_head.js") ;
var templateModuleExportFootPath =  path.resolve(module.filename,"../../lib/soyNodeTemplate_foot.js") ;
var fs = require('fs');
//删除源文件，则删除对应的JS文件
function delFile(filepath){
     fs.unlink('build/'+filepath.replace(/soy$/gi,'js'), function (err) {
       if (err) throw err;
       console.log('successfully deleted '+'build/'+filepath.replace(/soy$/gi,'js'));
     })
}
//module.load("build/template/template.js");
//新增和更新文件，则重新编译
function compileSoy(filepath,callBackFun){
      var free  = spawn('java', ['-jar',libPath,'--outputPathFormat','build/'+filepath.replace(/soy$/gi,'js'),'--srcs',filepath]);
      // 捕获标准输出并将其打印到控制台
      free.stdout.on('data', function (data) {
             console.log('标准输出：\n' + data);
      });

      // 捕获标准错误输出并将其打印到控制台
      free.stderr.on('data', function (data) {
             console.log('标准错误输出：\n' + data);
      });

       // 注册子进程关闭事件
      free.on('exit', function (code, signal) {
            //console.log('子进程已退出，代码：' + code);

            if(callBackFun != null && callBackFun instanceof Function){
                  callBackFun();
            }
      });


}

/*
 找到目录中所有的soy
 return filePathArray[] 文件路径数组
*/
function getDirSoyFiles(dirPath,fileFilter){
        var result = new Array();

        var files = fs.readdirSync(dirPath);
        //合并目录项面所有的js文件
        files.forEach(function(fileName,index,files){
          //忽略隐藏文件
          if(fileName.search(/^\./gi)!=-1){
             return;
          }else{

          }
          var status = fs.statSync(dirPath+"/"+fileName);
          if(status.isFile()){
              if(fileFilter != null){
                 if(fileFilter == "soy" && fileName.search(/\.soy$/gi)!=-1){
                   result.push(dirPath+"/"+fileName);
                 }else if(fileFilter == "js" && fileName.search(/\.js$/gi)!=-1){
                   result.push(dirPath+"/"+fileName);
                 }

              }else{
                  result.push(dirPath+"/"+fileName);
              }

              //console.log(fileName);
          }else if(status.isDirectory()){
              var subArray =  getDirSoyFiles(dirPath+"/"+fileName);

              result = result.concat(subArray);

          }
        });
        return result;
}
/**
  将所有的文件合并到
**/
function mergeFile(outPutPath,debugFilePath){
     var stringArray = new Array();
     var jsOutPutArray = new Array();
     var sourceStringArray = new Array();
     //添加文件头
     stringArray.push(fs.readFileSync(templateModuleExportHeadPath));
     jsOutPutArray.push(fs.readFileSync(jsOutPutHeadPath));
     //加载soyutilsjs
    sourceStringArray.push(fs.readFileSync(jsLibPath));
     var templateJSArray =  getDirSoyFiles(outPutPath+"/soy/");
     if(templateJSArray != null){
        console.log(templateJSArray);
        var i = 0,length =  templateJSArray.length;
        for(;i<length;i++){
            sourceStringArray.push(fs.readFileSync(templateJSArray[i]));
         };
     }
     stringArray = stringArray.concat(sourceStringArray);
    jsOutPutArray = jsOutPutArray.concat(sourceStringArray);
     //加载module.exports  文件 foot
     stringArray.push(fs.readFileSync(templateModuleExportFootPath));
    jsOutPutArray.push(fs.readFileSync(jsOutPutFootPath));
     //写到对应的文件中
     fs.writeFileSync(outPutPath+"/template.js", stringArray.join(""));
     fs.writeFileSync(debugFilePath+"/templateFront.debug.js", jsOutPutArray.join(""));
     console.log("文件合并完成");
}
/*
 扫描所有soy 目录下的soy文件，并编译成对应的js文件
*/
function mergeSoyDir(dirPath,callBackFn){
   var soyFiles = getDirSoyFiles(dirPath,"soy");
   var count = 0,length = soyFiles.length;
   console.log(count,length);
   soyFiles.forEach(function(filePath,index,soyFiles){
       if(filePath.search(/\.soy$/gi)!= -1){
           compileSoy(filePath,function(){
                count++;console.log(count,length);
                if(count >= length){
                    callBackFn();
                }
           });
           console.log(filePath);
       }

   });

}
/**压缩合并文件**/
function compileMergeFile(filePath){
    var free  = spawn('java', ['-jar',compileLibPath,'--js ',filePath,' --externs ',compileExternsPath,' --js_output_file ',compileOutputPath,' --compilation_level ADVANCED_OPTIMIZATIONS']);
    // 捕获标准输出并将其打印到控制台
    free.stdout.on('data', function (data) {
        console.log('标准输出：\n' + data);
    });

    // 捕获标准错误输出并将其打印到控制台
    free.stderr.on('data', function (data) {
        console.log('标准错误输出：\n' + data);
    });
    free.on('exit', function (code, signal) {
        console.log('子进程已退出，代码：' + code);
    });
}
module.exports.mergeDir = function(options){
   if(options.outPutPath){
       buidTemplatePath = options.outPutPath;
   }
   if(options.debugFilePath){
       debugTemplateFrontPath = options.debugFilePath;
   }
   mergeSoyDir(options.sourceDir,function(){
                    mergeFile(options.outPutPath,options.debugFilePath);
               });

};
module.exports.parse = function(filepath,action){

        switch(action){
          case "added":
          case "changed":
              compileSoy(filepath,function(){
                 mergeFile(buidTemplatePath,debugTemplateFrontPath);
              });
              break;
          case "deleted":
              delFile(filepath);
              break;
          default:
              break;
        }

}
