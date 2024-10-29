import { startProject } from "../darkhorse/darkhorse.js";

const config = {
	"port": 3000,
	"ratelimiting": false,
	"rootHtml": "index.html"
}

startProject("./project", config)