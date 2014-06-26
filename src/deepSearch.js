/**
 * 模板文件的深度递归分析
 */

function TplNode(){
    this.prototype.init.apply(this,arguments);
}

TplNode.prototype={
    init:function(rootPath,relativePath){
        this.rootPath = rootPath;
        this._path = relativePath;
    },
    _getFileContent:function(){

    },
    //获得模板的一级子节点
    _getChildren:function(fileContent){
        //匹配子模板的正则
        var childrenArray = fileContent.match(/{call\s*\S*.*}/gi);
        for(var l = childrenArray.length;l--; ){
            var item = childrenArray[l];
            var fileNameArray = item.match(/\s\S*[^},^=]/gi);
            if(fileNameArray.length>0){
                var fileName = fileNameArray[0];
            }
        }
    },
    /**
     *将模板名称转换成文件路径
     * @return {String} filePath
     */
    _changeTplNameToPath:function(soyName){
        //判断是否是相对路径
        var isRelativePath = soyName.search(/^\./gi) == -1?false:true;
        if(isRelativePath){
            //转化成据对路径
        }else{

        }
    }
};

module.exports = TplNode;