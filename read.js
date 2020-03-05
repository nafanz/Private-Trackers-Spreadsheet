const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

//joining path of directory 
const directoryPath = path.join(__dirname, 'Jackett/src/Jackett.Common/Definitions');
//passsing directoryPath and callback function

let trackers = {};
trackers.trackers = []

fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        //console.log(file);
        try {
            let fileContents = fs.readFileSync(path.join(directoryPath, file), 'utf8');
            let data = yaml.safeLoad(fileContents, {skipInvalid: true});
            //console.log(data);
            if (data.type == 'private') {
                let tracker = {
                    name: '',
                    description: '',
                    type: ''
                }
                tracker.name = data.name
                tracker.description = data.description
                let type = []
                //console.log(data);
                if (data.caps && data.caps.categorymappings) {
                    data.caps.categorymappings.forEach(function(category) {
                        type.push(category.cat.split("/")[0])
                    })
                    // remove duplicates
                    type = Array.from(new Set(type))
                    tracker.type = type.join(", ")
                } else if (data.caps.categories) {
                    data.caps.categorymappings.forEach(function(category) {
                        console.log(category)
                        type.push(category.cat.split("/")[0])
                    })
                    console.log(type)
                    // remove duplicates
                    type = Array.from(new Set(type))
                    tracker.type = type.join(", ")
                    console.log(tracker.type)
                }
                //console.log(tracker)
                trackers.trackers.push(tracker)
            }
        } catch (err) {
            // YAMLException
        }
    });

    const indexersPath = path.join(__dirname, 'Jackett/src/Jackett.Common/Indexers');

    fs.readdir(indexersPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            //console.log(file);
            try {
                const fileContents = fs.readFileSync(path.join(indexersPath, file), 'utf8');

                const isPrivate = fileContents.match(/Type.*"private"/i)
                if (isPrivate) {
                
                    let tracker = {
                        name: '',
                        description: '',
                        type: ''
                    }

                    const res = fileContents.match( /:\sbase\([^{]*"/s )
                    const lines = res[0].match(/[^\r\n]+/g);

                    for (const line of lines) {
                        const name = line.match(/.*name\:\s\"([\w\s\.\-\()]+)\"/i)
                        if (name) {
                            tracker.name = name[1]
                        }
                        else {
                            let name2 = line.match(/.*base\(\"([\w\s\.\-\()]+)\"/i)
                            if (name2) {
                                tracker.name = name2[1]
                            }
                        }

                        const description = line.match(/.*[desc|description]\:\s\"([^\"]+)\"/i)
                        if (description) {
                            tracker.description = description[1]
                        }
                    }

                    let type = []
                    const fileLines = fileContents.match(/[^\r\n]+/g)
                    for (const line of fileLines) {
                        if (line.includes("AddCategoryMapping")) {
                            const category = line.match(/TorznabCatType\.([^,]+),/i)
                            if (category) {
                                //console.log(category[1])
                                type.push(category[1])
                            }
                        }
                    }
                    // remove duplicates
                    type = Array.from(new Set(type))
                    tracker.type = type.join(", ")

                    trackers.trackers.push(tracker)
                }
            } catch (err) {
                // 
            }
        });

        //console.log(trackers_found)
        /*for (const t of trackers_found) {
            console.log(t)
        }*/

        let data = JSON.stringify(trackers);
        fs.writeFileSync('trackers2.json', data);
    })
});
