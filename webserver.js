import { on } from "node:events";
import * as fs from "node:fs";
import * as http from "node:http";
import * as nodejsPath from "node:path";

const postEvents = new Map();

function startWebserver(outputPath, {rootHtml=undefined, port=3000, ratelimiting=false}, serverFunctions=new Map()){
	if(fs.existsSync(`${outputPath}/${rootHtml}`) === false){
		throw new Error("Specify a valid rootHtml in your config. See the documentation for more details.")
	}

	http.createServer((req, res)=>{

	// Add req.ip
	// Not guaranteed
	req.ip = req.socket.address || req.headers["x-forwarded-for"].split(",::").shift()

	// Rate limiting
	if(ratelimiting === true){
		let ipMap = new Map();
		if(ipMap.has(req.ip) === false) ipMap.set(req.ip, [0, Date.now()])
		let ipObj = ipMap.get(req.ip)
		ipObj[0] = Math.max(0, (ipObj[0]+1)-(Date.now()-ipObj[1])/1000)
		if(ipObj[0] > 100){
		  res.writeHead(503);
		  res.end();
		  return
		}
		ipObj[1] = Date.now();
		ipMap.set(req.set, ipObj)
	}
	
	// Add req.cookies
	req.cookies = [];
	if(req.headers.cookie){
	  req.headers.cookie.split(";").map((str)=>{
	    cookies.push(str.trim().split("="))
	  });
	}
	
	// Add req.urlArr
	req.urlArr = req.url.split("/");
	req.urlArr.shift();
	if(req.url.endsWith("/") === true) req.urlArr.pop();

	if(req.method === "POST"){
		// Parse the JSON
		let body = "";
        req.on('data', chunk => {
        	body += chunk.toString();
        });
        req.on('end', () => {
          	let id = undefined;
          	let content = undefined;
          	try {
            	let obj = JSON.parse(body);
            	id = obj.id;
            	content = obj.content;
         	} catch(err){
            	// Invalid JSON
            	res.writeHead(400);
            	res.end();
            	return;
          	}

		  	let filePath = req.urlArr.join("/");
		  	if(filePath === "") filePath = rootHtml
		  	if(fs.existsSync(`${outputPath}/${filePath}`) === true){
			if(fs.statSync(`${outputPath}/${filePath}`).isFile() === false){
				let files = fs.readdirSync(`${outputPath}/${filePath}`).filter((v)=>v.endsWith(".html"));
				if(files.length > 1){
					res.writeHead(404);
					res.end();
					return;
				}
				filePath = `${filePath}\\${files[0]}`
    	  		}
			}
			
			if(postEvents.has(filePath+id)) postEvents.get(filePath+id)(req, res, content)
		})
		return;
	}

	if(req.method === "GET"){
    	let filePath = req.urlArr.join("/");
    	if(filePath.includes("..") === true){
    		res.writeHead(500, {"Content-Type": "text/html"})
    	  	res.write("Invalid url!");
    	  	res.end();
    	  	return;
    	}

		if(filePath === "") filePath = rootHtml
    	if(fs.existsSync(`${outputPath}/${filePath}`) === true){
			if(fs.statSync(`${outputPath}/${filePath}`).isFile() === false){
				let files = fs.readdirSync(`${outputPath}/${filePath}`).filter((v)=>v.endsWith(".html"));
				if(files.length > 1){
					res.writeHead(404);
					res.end();
					return;
				}
				filePath = `${filePath}\\${files[0]}`
    	  	}

			if(serverFunctions.has(filePath)){
				let functions = serverFunctions.get(filePath);
				let client = {}
				client.on = function(id, funct){
					postEvents.set(filePath+id, funct);
				}
				for(let funct of functions) eval(funct);
			}
			if(filePath.endsWith(".html")) res.writeHead(200, {"Content-Type": "text/html"})
			res.write(fs.readFileSync(`${outputPath}/${filePath}`));
    	  	res.end();
			return;
		}else{
    	  	res.writeHead(404);
    	  	res.end();
    	}
	}

	}).listen(port, function(){
		console.log(`[DarkhorseJs] Listening on port ${port}`)
	})
}

export { startWebserver }