var fs = require('fs');
var rootDirectoryName = "new_fiddles";
fs.makeDirectory(rootDirectoryName);
var sourceDirectoryNameArray = ['Chart', 'Gauge', 'Map'];
var sourceDirectoryRootName = "fiddles/";

for(var index in sourceDirectoryNameArray) {
	var path = sourceDirectoryRootName + sourceDirectoryNameArray[index]+"/";
	var list = fs.list(path);
	for(var index2 = 0; index2 < list.length; index2++){
	    if(list[index2]!="." && list[index2]!="..") {
	    	fs.makeDirectory(rootDirectoryName+"/"+sourceDirectoryNameArray[index].toLowerCase());
	    	fs.makeDirectory(rootDirectoryName+"/"+sourceDirectoryNameArray[index].toLowerCase()+"/"+list[index2].toLowerCase());
	    	var childDirectoryLists = fs.list(path+list[index2]+"/");
	    	var data = {};
	    	for(var index3 in childDirectoryLists) {
	    		if(childDirectoryLists[index3]!="." && childDirectoryLists[index3]!="..") {
	    			var jsonFilePath = path+list[index2]+"/"+childDirectoryLists[index3]+"/"+"data.json";
	    			if(fs.isFile(jsonFilePath)) {
	    				var fileData = JSON.parse(fs.read(jsonFilePath));
	    				data[list[index2].toLowerCase()+"-"+childDirectoryLists[index3].split("_")[0].toLowerCase()] = fileData[childDirectoryLists[index3].split("_")[0]];
	    			}	
	    		}
	    	}
	    	fs.write(rootDirectoryName+"/"+sourceDirectoryNameArray[index].toLowerCase()+"/"+list[index2].toLowerCase()+"/"+"chartsSpec.json", JSON.stringify(data, null, 4), 'w');
	    }
	}	
}


phantom.exit();
