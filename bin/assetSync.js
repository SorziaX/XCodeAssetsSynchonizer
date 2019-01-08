var fs = require('fs');

module.exports = {
    run : function(){

        var jsonName = 'Contents.json';
        var tempJsonName = 'Contents.json';
        var imageset = ".imageset";
        var appiconset = ".appiconset";
        var fileNameExts = [imageset];
        var ignoreFileNameExts = [appiconset];

        var syncConfig = fs.readFileSync('syncConfig.json', 'utf8').toString();
        if(syncConfig){
            var syncConfigJson = JSON.parse(syncConfig);
            var defaultDir = syncConfigJson["path"];
        }
        if(!defaultDir){
            defaultDir = ".";
        }

        var dirs = walk(defaultDir);

        dirs.forEach(function(item,index){
            synchonizeDir(item);
        });

        console.log("asset sync complete");

        ////-----------------------------
        //同步当前文件夹下的文件
        function synchonizeDir(dir){

            if(dir == "."){
                return;
            }

            //得到完整Contents.json文件名
            var jsonFullPath = dir + '/' + jsonName;
            var tempJsonFullPath = dir + '/' + tempJsonName;

            if(!fs.existsSync(jsonFullPath)){
                return;
            }

            //读取Contents.json文件
            var data = fs.readFileSync(dir + '/' + 'Contents.json', 'utf8');
            var json = JSON.parse(data);
            if(!json['images']){
                return;
            }
            
            //从当前目录Path中，获得资源文件名
            var dirItems = dir.split('/');
            var resourceName = dirItems[dirItems.length - 1];

            //扩展名处理
            var extIndex;
            fileNameExts.forEach(function(ext,i){
                if((extIndex = resourceName.indexOf(ext)) > -1){
                    if(extIndex == resourceName.length - ext.length){
                        resourceName = resourceName.substring(0,extIndex);
                        return;
                    }
                }
            });

            //无视扩展名处理
            var ignored = false;
            ignoreFileNameExts.forEach(function(ext,i){
                if((extIndex = resourceName.indexOf(ext)) > -1){
                    ignored = true;
                    return;
                }
            });
            if(ignored){
                return;
            }

            //输出
            /*
            console.log("");
            console.log("[jsonFullPath] : "+jsonFullPath);
            console.log("[resourceName] : "+resourceName);
            */

            //遍历Contents.json中的images
            json['images'].forEach(function(image,index){
                var fileName = image['filename'];
                var oldFileName = fileName;
                if(!fileName){
                    return;
                }
                
                //新文件名
                var scale = image['scale'];
                if(scale){
                    //有scale属性的时候，就使用scale属性对文件名重命名
                    var fileNameItems = fileName.split('.');
                    var fileExt = "";
                    if(fileNameItems.length > 1){
                        var fileExt = "." + fileNameItems[fileNameItems.length - 1];
                    }

                    if(scale == "1x"){
                        fileName = resourceName + fileExt;
                    }else{
                        fileName = resourceName + "@" + scale + fileExt;
                    }

                }else{
                    //没有scale属性的时候，就替换文件名中的 "真实文件名称"，其他部分拼接 
                    var fileNameItems = fileName.split('@');
                    if(fileNameItems.length > 2){
                        console.log(fileNameItems.length);
                        console.log("too many file name items");
                        return;
                    }
                
                    var fileNameFront = fileNameItems[0];
                    if(fileNameItems.length == 1 && fileNameFront.indexOf(".") >= 0){
                        fileNameFrontItems = fileNameFront.split('.');
                        fileName = resourceName + "." + fileNameFrontItems[1];
                    }else{
                        fileName = resourceName + "@" + fileNameItems[1];
                    }
                }
            
                //目录中的文件名修改
                var fullOldName = dir + '/' + oldFileName;
                var fullNewName = dir + '/' + fileName;
                if(fs.existsSync(fullOldName)){

                    if(fullOldName != fullNewName){
                        console.log("Rename " + fullOldName + " -> " + fullNewName);
                        fs.renameSync(fullOldName, fullNewName);
                    }
                }

                //修改Contents.json中的文件名
                json['images'][index]['filename'] = fileName;
            });
            
            //生成新的Contents.json
            var resultData = JSON.stringify(json,null,"  ");
            resultData = resultData.replace(new RegExp(/(": )/g),'" : ')

            fs.writeFileSync(tempJsonFullPath,resultData);
            fs.renameSync(tempJsonFullPath,jsonFullPath);
        }

        function walk(dir) {
            var children = [];
            children.push(dir);
            fs.readdirSync(dir).forEach(function(filename){
                var path = dir+"/"+filename;
                var stat = fs.statSync(path);
                if (stat && stat.isDirectory()) {
                    children = children.concat(walk(path));
                }
                else {
                    return;
                }
            });
            return children;
        }

        return;
    }
};