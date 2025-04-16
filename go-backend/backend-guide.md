## How to backend

### Installing Go!

To run the backend you need the latest version of Go! installed. You can get that from 
[here](https://go.dev/dl/). Install the verison for you computer.

### Running server

To run the server, make sure you are in the same directory as `server.go`. Run `go run server.go`. All dependencies will be automatically installed (I think).

### Adding routes

Routes consist of two parts, function and registering. Make the function in in a file named for the path, e.g. GET/library would have a file called library.go. GET and PUT functions would both go in there. Then, to register the route, add `e.<METHOD>("/<path>", <function>)` to server.go in the routes portion.

### Documentation

Document every route with its own md file in /docs. Be sure to include what parameters are needed (search query, json body, auth, etc), and the various return codes as well as the expected return body in json.

### Additional docs

Documentation for the framework (echo) is [here](https://echo.labstack.com/docs).