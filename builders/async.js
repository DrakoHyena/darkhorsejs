import { parse } from "node-html-parser";
import * as fs from "node:fs";
import { mkdir, access, readFile, writeFile, copyFile } from "node:fs/promises";
import * as nodejsPath from "node:path";

function _buildAsync(projectPath, dhjsPath, dir, serverFunctions, finishedBuild){
	const clientLibCode = fs.readFileSync(`${dhjsPath.startsWith("C") ? "" : "/"}${dhjsPath}/clientLib.js`, { encoding: "utf8" });
	function addServerFunction(file, content){
		if (serverFunctions.has(file) === false) serverFunctions.set(file, []);
		let dat = serverFunctions.get(file)
		dat.push(content)
		serverFunctions.set(file, dat)
	}

	for (let dirI = 0; dirI < dir.length; dirI++) {
		const file = `${dir[dirI].replaceAll("\\", "/")}`;

		// Html files
		if (file.endsWith(".html") === true) {
			const parsed = parse(`
				<script>
				${clientLibCode}
				</script>
				${fs.readFileSync(`${projectPath}/${file}`, { encoding: "utf8" })}
			`);

			const serverScripts = parsed.querySelectorAll(`script[side="server"]`);
			for (let serverScript of serverScripts) {
				serverScript.remove()
				if (serverScript.attributes.src) {
					if (serverScript.innerText !== "") {
						throw new Error("Server sided scripts with the src attribute must be empty")
					}
					if (serverScript.attributes.src.endsWith(".js") === false) {
						throw new Error("Server sided scripts with the src attribute must be javascript")
					}
					access(`./${serverScript.attributes.src}`).then((exists)=>{
						if(exists !== undefined){
							throw new Error(`Could not find server sided script: ./${serverScript.attributes.src}`)
						}
						readFile(`./${serverScript.attributes.src}`, { encoding: "utf8" }).then((contents)=>{
							addServerFunction(file, contents);
						})
					})
					continue;
				}
				addServerFunction(file, serverScript.innerText);
			}

			mkdir(`./output/${nodejsPath.dirname(file)}`, { recursive: true }).then(()=>{
				writeFile(`./output/${file}`, parsed.toString()).then(()=>{
					if (dirI === dir.length - 1) finishedBuild();
				})
			})
		} else {
			// Other files
			mkdir(`./output/${nodejsPath.dirname(file)}`, { recursive: true }).then(()=>{
				copyFile(`${projectPath}/${file}`, `./output/${file}`).then(()=>{
					if (dirI === dir.length - 1) finishedBuild();
				})
			})
		}
	}
}

export { _buildAsync }