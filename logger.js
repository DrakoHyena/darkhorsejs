function getStart(){
	let str = `[${process.uptime()/1000|0}]`
	for(let arg of arguments){
		str += `[${arg}]`
	}
	return str
}

function debug(){
	console.log(getStart("DEBUG", `LV${Array.prototype.splice.call(arguments, 0, 1)}`), ...arguments)
}

export { debug }