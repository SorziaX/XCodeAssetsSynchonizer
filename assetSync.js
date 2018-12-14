var fs = require('fs');
var jsonName = 'Contents.json';
var tempJsonName = 'Contents.json';
var imageset = ".imageset";
var appiconset = ".appiconset";
var fileNameExts = [imageset,appiconset];

var syncConfig = fs.readFileSync('syncConfig.json', 'utf8').toString();
if(syncConfig){
    var syncConfigJson = JSON.parse(syncConfig);
    var defaultDir = syncConfigJson["path"];
}
if(!defaultDir){
    defaultDir = ".";
}

var dirs = walk(defaultDir);
console.log(dirs);

dirs.forEach(function(item,index){
    synchonizeDir(item);
});

////-----------------------------
function synchonizeDir(dir){

    if(dir == ".")
        return;

    var jsonFullPath = dir + '/' + jsonName;
    var tempJsonFullPath = dir + '/' + tempJsonName;
    console.log("");
    console.log("[jsonFullPath] : "+jsonFullPath);
    if(!fs.existsSync(jsonFullPath)){
        return;
    }

    var data = fs.readFileSync(dir + '/' + 'Contents.json', 'utf8');
    var json = JSON.parse(data);
    if(!json['images']){
        return;
    }
    
    var dirItems = dir.split('/');
    var resourceName = dirItems[dirItems.length - 1];
    var index;

    fileNameExts.forEach(function(ext,index){
        if(index = resourceName.indexOf(ext)){
            if(index == resourceName.length - ext.length){
                resourceName = resourceName.substring(0,index);
                return;
            }
        }
    });

    console.log("[resourceName] : "+resourceName);
    
    json['images'].forEach(function(image,index){
        var fileName = image['filename'];
        var oldFileName = fileName;
        if(!fileName){
            return;
        }
    
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
    
        var fullOldName = dir + '/' + oldFileName;
        var fullNewName = dir + '/' + fileName;
        if(fs.existsSync(fullOldName)){

            console.log(fullOldName + " -> " + fullNewName);

            if(fullOldName != fullNewName){
                fs.renameSync(fullOldName, fullNewName);
            }
        }
        json['images'][index]['filename'] = fileName;
    });
    
    var resultData = JSON.stringify(json,null,"  ");
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