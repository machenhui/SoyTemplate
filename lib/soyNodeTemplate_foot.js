
function findFun(funStr){
    var keys = funStr.split(".");
    var fun = tpl;
    for(var i= 1,l=keys.length;i<l;i++){
        try{
            fun = fun[keys[i]];
        }catch(e){
            console.error(funStr,e);
            return null;
        }

    }
    return fun;
}
var funCache = {};
module.exports = function(templateName,data){
    var html = null;
    try{
        //var evaled = eval("html = "+templateName+"(data)");
        if(!funCache[templateName]){
            var fn = findFun(templateName);
            if(fn){
                funCache[templateName] = fn;
            }else{
                return "";
            }

        }
        html = funCache[templateName](data);
        return html;
        //if(evaled){
        //              return html;
        //}
    }catch(e){
        console.error("模板:"+templateName+" 错误",templateName.replace(/\//gi,"."),data, e.stack);
        return  "模板:"+templateName+" 错误:"+e.stack+" "+JSON.stringify(data);
    }
}