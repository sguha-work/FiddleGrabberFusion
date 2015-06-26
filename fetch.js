// to run this code use phantomjs fetch.js
var counter = -1;
var url = [];
var startRender;
var page;
var rootDirectoryName = "fiddles";
var newFiddleObjects = [];
var createFolderStructure = (function() {
    var fs = require('fs');
    var fiddleDataFileContent = JSON.parse(fs.read("fiddleData_new.js"));
    var categoryData = fiddleDataFileContent.ChildCategoryData;
    //creating folder for parent category data (chart, gauge, map)
    fs.makeDirectory(rootDirectoryName);
    fs.makeDirectory(rootDirectoryName + "/" + "Chart");
    fs.makeDirectory(rootDirectoryName + "/" + "Gauge");
    fs.makeDirectory(rootDirectoryName + "/" + "Map");

    for (var index in categoryData) {
        var visTypeFirstValue = categoryData[index].visualization_type.split(",")[0];
        var categoryName = categoryData[index].cat_name;
        if (categoryName.indexOf(' ') != -1) {
            categoryName = categoryName.split(" ").join("-").split("/").join("-").split("%").join("-").split(",").join("-");
        }
        if (categoryName != "Chart" && categoryName != "Gauge" && categoryName != "Map") {
            categoryName = categoryName.split(",").join("-");
            if (visTypeFirstValue == "Chart") {
                fs.makeDirectory(rootDirectoryName + "/" + "Chart/" + categoryName);
            } else if (visTypeFirstValue == "Map") {
                fs.makeDirectory(rootDirectoryName + "/" + "Map/" + categoryName);
            } else if (visTypeFirstValue == "Gauge") {
                fs.makeDirectory(rootDirectoryName + "/" + "Gauge/" + categoryName);
            }
        }
    }
    url = fiddleDataFileContent.FiddlesData;
});

createFolderStructure();

page = require('webpage').create();
startRender = (function() {
    counter += 1;
    if (counter >= url.length) {
        var fs = require('fs');
        fs.write("log.json", JSON.stringify(newFiddleObjects), 'w');
        phantom.exit();
    }

    if (counter > newFiddleObjects.length) {
        counter -= 1;
    }
    console.log("****** " + (counter+1) + " " + url[counter].fiddle_url + " *****");
    page.open(url[counter].fiddle_url, function(status) {
        if (status == 'success') {
            createLocalFiles();
        } else {
            console.log("Unable to open the file.");
        }
    });
});
var createLocalFiles = (function() {
    console.log("****** " + counter + " *****");

    if (1) {
        if (page.injectJs('jquery.js')) {
            var fs = require('fs');
            var value = page.evaluate(function() {
                var html = $('#id_code_html').text();
                var js = $('#id_code_js').text();

                var css = $('#id_code_css').text();
                var resources = [];
                $("a.filename").each(function() {
                    resources.push($(this).attr('href'));
                });
                var options = {};
                options.description = $('#id_description').text();
                options.title = $("#id_title").val();
                return {
                    html: html,
                    js: js,
                    css: css,
                    resources: resources,
                    options: options
                };

            });
            var fiddleId = url[counter].fiddle_id;
            var categoryIdArray = [];
            var fiddleDataFileContent = JSON.parse(fs.read("fiddleData_new.js"));
            for (var index in fiddleDataFileContent.FiddleToCategory) {
                if (fiddleDataFileContent.FiddleToCategory[index].fiddle_id == fiddleId) {
                    categoryIdArray.push(fiddleDataFileContent.FiddleToCategory[index].category_id);
                }
            }
            var categoryNameArray = [];
            for (var index in categoryIdArray) {
                var catName = "";
                var visName = "";
                for (var index2 in fiddleDataFileContent.ChildCategoryData) {
                    if (fiddleDataFileContent.ChildCategoryData[index2].cat_id == categoryIdArray[index]) {
                        catName = (fiddleDataFileContent.ChildCategoryData[index2].cat_name).split(" ").join("-").split("/").join("-").split("%").join("-").split(",").join("-");
                        visName = fiddleDataFileContent.ChildCategoryData[index2].visualization_type.split(",")[0];
                        break;
                    }
                }
                categoryNameArray.push({
                    cat_name: catName,
                    vis_name: visName
                });
            }
            for (var index in categoryNameArray) {
                if (categoryNameArray[index].cat_name != "Chart" && categoryNameArray[index].cat_name != "Gauge" && categoryNameArray[index].cat_name != "Map") {
                    var rootFolderName = categoryNameArray[index].vis_name + "/" + categoryNameArray[index].cat_name;
                    var name = url[counter].fiddle_description.split(" ").join("-").split("/").join("-").split("%").join("-").split(",").join("-");
                    var folderName = rootDirectoryName + "/" + rootFolderName + "/" + name;
                    folderName += "_" + counter;
                    fs.makeDirectory(folderName);
                    var jsData = value.js.split("new FusionCharts(")[1].split(".render()")[0].trim();
                    jsData = jsData.substring(0, (jsData.length - 1)).split("'").join('\"');
                    var newString = "";
                    for (var index = 0; index < jsData.length; index++) {
                        if (jsData[index] == ":" && jsData[index - 1] != '"') {
                            newString += '"' + jsData[index];
                            var tempString = "";
                            var index2 = index;
                            while (newString[index2] != " ") {
                                index2 -= 1;
                            }
                            for (var index3 = 0; index3 < newString.length; index3++) {
                                if (index3 == index2 + 1) {
                                    tempString += '"' + newString[index3];
                                } else {
                                    tempString += newString[index3];
                                }
                            }
                            newString = tempString;
                        } else {
                            newString += jsData[index];
                        }
                    }
                    fs.write(folderName + "/" + "data.json", "{\"" + name + "\":{\"options\": " + newString + "}\r\n}", 'w');
                    fs.write(folderName + "/" + "url.txt", url[counter].fiddle_url, 'w');
                    var grabStatus = ((newString.length)?1:0);
                    var newFiddleObject = {
                        fiddle_id: counter,
                        fiddle_link: url[counter].fiddle_url,
                        fiddle_grab_status: grabStatus
                    };
                    newFiddleObjects.push(newFiddleObject);
                }
            }
            console.log("****file write done****");
        }
    }


});


setInterval(function() {
    startRender();
}, 30000);
