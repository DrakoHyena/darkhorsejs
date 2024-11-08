import * as fs from "node:fs";
import * as nodejsPath from "node:path";
import { parse } from "node-html-parser";
import { _startWebserver } from "./webserver.js"

const dhjsPath = nodejsPath.dirname(import.meta.url).slice(8);


function startProject(path, config={
	"port": 3000,
	"ratelimiting": false,
	"rootHtml": undefined,
	"copySync": false
}) {
	const start = Date.now();
	if(fs.existsSync("./output") === true){
		fs.rmSync("./output", {recursive: true, force: true});
	}
	fs.mkdirSync("./output");

	if (fs.existsSync(path) === false) {
		throw new Error(`Failed to find path: ${path}`);
	}



	const dir = fs.readdirSync(path, { recursive: true });

function getFiles(dir, arr=[]) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  for(let dirent of dirents){
	if(dirent.isDirectory()){
		getFiles(`${dirent.parentPath}/${dirent.name}`, arr)
	}else{
		arr.push(`${dirent.parentPath}/${dirent.name}`)
	}
  }
  return arr;
  /*const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));*/
}
	console.log(getFiles(path))
	
	const serverFunctions = new Map();
	function finishedBuild(){
		console.log(`[DarkhorseJs] Built project in ${(Date.now() - start) / 1000}s`);
	}
	for (let dirI = 0; dirI < dir.length; dirI++) {
		const file = dir[dirI];
		if(file.includes(".") === false) continue;

		// Html files
		if(file.endsWith(".html") === true){
			const parsed = parse(`
				<script>
				${fs.readFileSync(`${dhjsPath.startsWith("C")?"":"/"}${dhjsPath}/clientLib.js`, {encoding: "utf8"})}
				</script>
				${fs.readFileSync(`${path}/${file}`, { encoding: "utf8" })}
			`);

			const serverScripts = parsed.querySelectorAll(`script[side="server"]`);
			for(let serverScript of serverScripts){
				serverScript.remove()
				let content = serverScript.innerText;
				if(serverScript.attributes.src){
					if(serverScript.innerText !== ""){
						throw new Error("Server sided scripts with the src attribute must be empty")
					}
					if(serverScript.attributes.src.endsWith(".js") === false){
						throw new Error("Server sided scripts with the src attribute must be javascript")
					}
					if(fs.existsSync(`./${serverScript.attributes.src}`) === false){
						throw new Error(`Could not find server sided script: ./${serverScript.attributes.src}`)
					}
					content = fs.readFileSync(`./${serverScript.attributes.src}`, {encoding: "utf8"})
				}

				if(serverFunctions.has(file) === false) serverFunctions.set(file, []);
				let dat = serverFunctions.get(file)
				dat.push(content)
				serverFunctions.set(file, dat)
			}

			fs.mkdirSync(`./output/${nodejsPath.dirname(file)}`, {recursive: true})
			fs.writeFileSync(`./output/${file}`, parsed.toString())
			if(dirI === dir.length-1) finishedBuild();
		}else{
			// Other files
			fs.mkdirSync(`./output/${nodejsPath.dirname(file)}`, {recursive: true})
			if(config.copySync === true){
				fs.copyFileSync(`${path}/${file}`, `./output/${file}`)
				if(dirI === dir.length-1) finishedBuild();
			}else{
				fs.copyFile(`${path}/${file}`, `./output/${file}`, 0, ()=>{
					if(dirI === dir.length-1) finishedBuild();
				})
			}
		}
	}

	_startWebserver(nodejsPath.resolve("./output"), config, serverFunctions)
}

export { startProject }