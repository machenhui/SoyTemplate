/*
 * grunt-closure-template
 * https://github.com/machenhui/grunt-closure-template
 *
 * Copyright (c) 2013 machenhui
 * Licensed under the MIT license.
 */

'use strict';
var compiler = require("./compiler-soy");
function createWatchAction(grunt,actionName,files){
	actionName = actionName.replace(/:/gi,"$_$");
	var config ={};
	config[actionName] = {
			files:files+"/**/*.soy",
			options:{
				spawn:false,
				interrupt:true,
				event:'all'
			}
	};
	grunt.initConfig({
		  watch:config
	});
	grunt.event.on('watch', function(action, filepath, target) {
        console.log("action\t",action,target);
        if(target == actionName){
        	compiler.parse(filepath,action);
        }
	 });
	grunt.task.run(["watch:"+actionName]);
}
module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  
  
  grunt.registerMultiTask('closure_template', 'compile soy file', function() {
    console.log(this.data.options);
    console.log("合并所有的文件");
    compiler.mergeDir(this.data.options);
    createWatchAction(grunt,this.nameArgs,[this.data.options.sourceDir]);
  });

};
