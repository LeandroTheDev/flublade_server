const express = require('express');
const http = express();


function init(resolve) {
    //Enable json suport
    http.use(express.json());

    //Ports for the server
    http.listen(8080, () => {
        console.log('Server Responses started in ports 8080');
        resolve(http);
    });
}

module.exports = function () {
    return new Promise((resolve, reject) => {
        init(resolve);
    });
}