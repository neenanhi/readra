package main

import (
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	// ROUTES
	e.GET("/example", example)

	e.Logger.Fatal(e.Start(":1323"))

}

//testing
