package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	e.GET("/users/:id", getUser)

	e.Logger.Fatal(e.Start(":1323"))

	// ROUTES
}
