import { startProject } from "../../builder.js";

const config = {
	"port": 3000,
	"ratelimiting": false,
	"rootHtml": "index.html",
	"async": false,
}

startProject("./examples/project", config)