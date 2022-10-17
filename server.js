const http = require('http');
const port = 3000;
const url = require('url');
const fs = require('fs');
const path = require('path');
const baseDirectory = __dirname; 


http.createServer(function (request, response) {
    try {
        let requestUrl = url.parse(request.url)

        // normalize the path realtive to the base director
        let fsPath = baseDirectory+path.normalize(requestUrl.pathname)
        
        //open page upon tpying localhost
        if(fsPath == baseDirectory.normalize()+"/"){

            fsPath += "index.html"

        }

        //create a readable file stream
        let fileStream = fs.createReadStream(fsPath)
        fileStream.pipe(response)
        fileStream.on('open', function() {
             response.writeHead(200)
        })
        fileStream.on('error',function(e) {
            // assume the file doesn't exist
             response.writeHead(404)
             response.end()
        })
   } catch(e) {
        response.writeHead(500)
        // end the response so browsers don't hang
        response.end()
   }
}).listen(port)

console.log("listening on port "+port)