import { startProject } from "../index.js";

const config = {
	"port": 3000,
	"ratelimiting": false,
	"rootHtml": "index.html"
}

startProject("./project", config)