package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/supabase-community/supabase-go"
)

// func main() {
// 	e := echo.New()

// 	// ROUTES
// 	e.GET("/example", example)
// var client *supabase.Client

type Book struct {
	ID          string `json:"id"`
	CreatedAt   string `json:"created_at"`
	Title       string `json:"title"`
	Author      string `json:"author"`
	CoverImage  string `json:"cover_image"`
	Description string `json:"description"`
	Genre       string `json:"genre"`
	ISBN        int64  `json:"isbn"`
	User        string `json:"user"`
}

func main() {
	// Retrieve supabase URL and KEY from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	e := echo.New()

	// Setup supabase connection
	client, err := supabase.NewClient(supabaseUrl, supabaseKey, &supabase.ClientOptions{})

	// GET user library (all books associated with a user)
	// EXAMPLE REQUEST: "localhost:1323/library/USERID"
	e.GET("/library/:userID", func(c echo.Context) error {
		userID := c.Param("userID")
		var results []Book

		// Corrected: ExecuteTo returns (count, error)
		count, err := client.
			From("book").
			Select("*", "exact", false).
			Eq("user", userID).
			ExecuteTo(&results)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to fetch books: " + err.Error(),
			})
		}

		// You can use count if needed
		log.Printf("Found %d books", count)
		for i, val := range results {
			fmt.Println("The Array Item at ", i, "Index Position = ", val)
		}
		return c.JSON(http.StatusOK, results)
	})

	e.POST("/book", func(c echo.Context) error {
		// All your PostBook logic here
		var newBook Book
		if err := c.Bind(&newBook); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": "Invalid request body",
			})
		}
		//responsemsg, status code, error
		_, _, err := client.
			From("book").
			Insert(newBook, false, "", "", "").
			Execute()

		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to insert book: " + err.Error(),
			})
		}

		return c.JSON(http.StatusCreated, map[string]string{
			"message": "Book added successfully!",
		})
	})

	e.Logger.Fatal(e.Start(":1323"))

}
