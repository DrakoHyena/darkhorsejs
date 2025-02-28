# Darkhorse.js
Darkhorse is javascript framework to quickly spin up websites. Server code is stored in the html offering a more integrated and intuitive experience. (server code is not sent to clients).

## Docs
Look at the examples folder if youre confused on anything :-)
### ./OUTPUT
This is a generated directory. Changes made will not be saved.
### IMPORTS & EXPORTS
Compiled server sided code cannot contain any import or export statements. However, you can use dynamic imports to import non-compiled server files which which can use imports and exports. This might be useful if you have a database utility. (by default fs and http are imported for you)
### HTML
- Attribute: side
	- server
		- The code inside the block will run on the server when the page is requested
		- Src can be used but the block must be empty and the url must be the filepath to desired js file
	- client
		- This is default although its better to specify for clarity
		- Code and src runs as normally

### Config
- port
	- The port the webserver runs on 
	- Default: 3000
- ratelimiting
	- A primative ratelimiting system
	- Every request from an ip raises their "score" by 1. If that score passes 100 a 503 error will be returned. Score is decreased by 1 per second.
	- Default: false
- rootHtml
	- The file to send when visiting "/"
	- Will error if no valid file is specified
	- Default: undefined
- async
	- Use with caution
	- Whether or not to build the project asynchronously
	- Most of the time, the webserver will start before the project has finished building which can lead to certain files or urls being inaccessible while the site is live. Granted, it wont be very long, but it leaves a window open for unexpected behavior, and if you access or change files in the output directory during runtime, it could result in errors because they are not guaranteed to be there.
	- This setting significantly speeds up the build process for big projects, especially if you have large files such as media (because you won't have to wait for them to be copied over before the site is up).
	- On paper, this setting greatly improves developer experience and in an overwhelming majority of cases should not be the cause or any errors.
	- Default: true

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
