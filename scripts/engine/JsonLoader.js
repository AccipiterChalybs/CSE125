/**
 * Created by Accipiter Chalybs on 4/25/2017.
 */
const JsonLoader = {

    loadJSON : function(url, func) {
        //from http://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
        if (IS_SERVER) {
            //call server method;
            let data=global.readScene(url);
            func(data);

        } else {
            let getJSON = function(url, callback) {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'json';
                xhr.onload = function() {
                    let status = xhr.status;
                    if (status === 200) {
                        callback(null, xhr.response);
                    } else {
                        callback(status);
                    }
                };
                xhr.send();
            };

            getJSON(url,
                function(err, data) {
                    if (err !== null) alert("ERROR loading json: " + err);
                    else func(data);
                });
        }
    }

};