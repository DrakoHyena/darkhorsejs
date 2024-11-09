import { parse } from "node-html-parser";
import * as fs from "node:fs";
import * as nodejsPath from "node:path";

function _buildSync(projectPath, dhjsPath, dir, serverFunctions, finishedBuild){
	const clientLibCode = fs.readFileSync(`${dhjsPath.startsWith("C") ? "" : "/"}${dhjsPath}/clientLib.js`, { encoding: "utf8" })
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
				let content = serverScript.innerText;
				if (serverScript.attributes.src) {
					if (serverScript.innerText !== "") {
						throw new Error("Server sided scripts with the src attribute must be empty")
					}
					if (serverScript.attributes.src.endsWith(".js") === false) {
						throw new Error("Server sided scripts with the src attribute must be javascript")
					}
					if (fs.existsSync(`./${serverScript.attributes.src}`) === false) {
						throw new Error(`Could not find server sided script: ./${serverScript.attributes.src}`)
					}
					content = fs.readFileSync(`./${serverScript.attributes.src}`, { encoding: "utf8" })
				}

				if (serverFunctions.has(file) === false) serverFunctions.set(file, []);
				let dat = serverFunctions.get(file)
				dat.push(content)
				serverFunctions.set(file, dat)
			}

			fs.mkdirSync(`./output/${nodejsPath.dirname(file)}`, { recursive: true })
			fs.writeFileSync(`./output/${file}`, parsed.toString())
			if (dirI === dir.length - 1) finishedBuild();
		} else {
			// Other files
			fs.mkdirSync(`./output/${nodejsPath.dirname(file)}`, { recursive: true })
			fs.copyFileSync(`${projectPath}/${file}`, `./output/${file}`)
			if (dirI === dir.length - 1) finishedBuild();
		}
	}
}

export { _buildSync }