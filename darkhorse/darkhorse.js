import * as fs from "node:fs";
import * as nodejsPath from "node:path";
import { parse } from "node-html-parser";
import { startWebserver } from "./webserver.js"

const dhjsPath = nodejsPath.dirname(import.meta.url).slice(8);

function startProject(path, config) {
	const start = Date.now();
	if(fs.existsSync("./output") === true){
		fs.rmSync("./output", {recursive: true, force: true});
	}
	fs.mkdirSync("./output");

	if (fs.existsSync(path) === false) {
		throw new Error(`Failed to find path: ${path}`);
	}
	if (fs.existsSync(`${path}/start.js`) === false){
		throw new Error(`Missing a start.js file. Check the documentation for more details.`)
	}

	const dir = fs.readdirSync(path, { recursive: true });
	const serverFunctions = new Map();
	for (let dirI = 0; dirI < dir.length; dirI++) {
		const file = dir[dirI];
		if(file.includes(".") === false) continue;

		// Html files
		if(file.endsWith(".html") === true){
			const parsed = parse(`
				<script>
				${fs.readFileSync(`${dhjsPath}/clientLib.js`, {encoding: "utf8"})}
				</script>
				${fs.readFileSync(`${path}/${file}`, { encoding: "utf8" })}
			`);

			const serverScripts = parsed.querySelectorAll(`script[side="server"]`);
			for(let serverScript of serverScripts){
				serverScript.remove()
				if(serverFunctions.has(file) === false) serverFunctions.set(file, []);
				let dat = serverFunctions.get(file)
				dat.push(serverScript.innerText)
				serverFunctions.set(file, dat)
			}

			fs.mkdirSync(`./output/${nodejsPath.dirname(file)}`, {recursive: true})
			fs.writeFileSync(`./output/${file}`, parsed.toString())
			continue;
		}

		// Other files
		fs.mkdirSync(`./output/${nodejsPath.dirname(file)}`, {recursive: true})
		fs.writeFileSync(`./output/${file}`, fs.readFileSync(`${path}/${file}`))
	}

	console.log(`[DarkhorseJs] ${(Date.now() - start) / 1000}s`);
	startWebserver(nodejsPath.resolve("./output"), config, serverFunctions)
}

export { startProject }