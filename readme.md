# Darkhorse.js
Darkhorse is javascript framework to quickly spin up websites. Server code is stored in the html offering a more integrated and intuitive experience. (server code is not sent to clients).

## Docs
Look at the examples folder if youre confused on anything :-)
### HTML
- Attribute: side
	- server
		- The code inside the block will run on the server when the page is requested
		- Src can be used but the block must be empty and the url must be the filepath to desired js file
	- client
		- This is default although its better to specify for clarity
		- Code and src runs as normally

### Client JS Library
- server
	- request(\<string\> id, \<string\> content, \<function\> success callback(\<string\> data), \<function\> failure callback)
  		- Sends a request to the given id with the provided content
  		- Ids are page specific meaning and id of abc will do different things on /home and /about
  		- Success callback is ran when the request was successfully responded to by the server
		- Failure callback is ran when the request fails or the server responds with an error
 ### Server JS Library
- client
	- on(\<string\> id, \<function\> callback(req, res, \<string\> content) )
		- Receives requests from the client on the given id
		- Content is the content sent by the client
		- req is a node http request object has a few additional things being .ip (not guaranteed to have the users real ip), .urlArr (the request url cleaned up and in an array), .cookies (an array of cookies sent with the request in this format [[name, data], [name, data]])
		- res is a node http response object
