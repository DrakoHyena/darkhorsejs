import * as fs from "node:fs";
import * as nodejsPath from "node:path";
import { _startWebserver } from "./webserver.js"
import { _buildAsync } from "./builders/async.js";
import { _buildSync } from "./builders/sync.js";

const dhjsPath = nodejsPath.dirname(import.meta.url).slice(8);

function startProject(projectPath, config = {
	"port": 3000,
	"ratelimiting": false,
	"rootHtml": undefined,
	"async": true
}) {
	const start = Date.now();
	function finishedBuild() {
		console.log(`[DarkhorseJs] Built project in ${(Date.now() - start) / 1000}s`);
	}

	if (fs.existsSync(projectPath) === false) {
		throw new Error(`Failed to find path: ${projectPath}`);
	}
	if (fs.existsSync(`${projectPath}/${config.rootHtml}`) === false){
		throw new Error(`Failed to find rootHtml file: ${projectPath}/${config.rootHtml}`)
	}

	if (fs.existsSync("./output") === true) {
		fs.rmSync("./output", { recursive: true, force: true });
	}
	fs.mkdirSync("./output");

	const dir = getFiles(projectPath);
	function getFiles(pathParam, arr = []) {
		const dirents = fs.readdirSync(pathParam, { withFileTypes: true });
		for (let dirent of dirents) {
			if (dirent.isDirectory()) {
				getFiles(`${dirent.path}/${dirent.name}`, arr)
			} else {
				arr.push(`${dirent.path.replace(projectPath, "")}/${dirent.name}`)
			}
		}
		return arr;
	}

	const serverFunctions = new Map();
	if(config.async === true){
		_buildAsync(projectPath, dhjsPath, dir, serverFunctions, finishedBuild)
	}else{
		_buildSync(projectPath, dhjsPath, dir, serverFunctions, finishedBuild)
	}

	_startWebserver(nodejsPath.resolve("./output"), config, serverFunctions)
}

export { startProject }