window.server = {}

server.request = function(id, content, cbSuccess, cbFail=console.error){
	if(typeof id !== "string"){
		throw new Error("The id of a request must be a string", id)
	}
	if(typeof content !== "string"){
		throw new Error("The content of a request must be a string", content)
	}
	fetch(``, {
		method: "POST",
		body: JSON.stringify({id, content})
	}).then(res=>res.text()).then(cbSuccess).catch(cbFail);
}