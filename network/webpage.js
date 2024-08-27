import debug from "../logger.js"
import * as uws from "./uWebSockets.js-20.43.0/uws.js";

const APP = uws.default.App({}).ws("/", {
	open: (ws) => {

	},
	message: (ws, message, isBinary) => {

	},
	close(ws) {
		allWebsockets.delete(ws);
	}
}).get('/*', (res, req) => {
	const url = req.getUrl();
	if (url.includes("..")){
		debug(1, 'Request blocked due to url containing ".."');
		return;
	}
	if(url === "/"){
	}else if(url.startsWith("/js/")) {
		res.writeStatus('200 OK').writeHeader("Content-Type", "text/html; charset=utf-8").end(fs.readFileSync("./client/index.html"));
		return;
	} else if (url.startsWith("/assets/") === true) {
		console.log(url.split("/"))
		res.writeStatus('200 OK').writeHeader("Content-Type", "image/png; charset=utf-8").end(fs.readFileSync(`./client/assets/${url.split("/")[2]}`));
		return;
	} else {
		res.writeStatus("404 Non-existant").end();
	}
}).listen(3001, (listenSocket) => {
	if (listenSocket) {
		console.log('Listening to port 3001');
	}
})
