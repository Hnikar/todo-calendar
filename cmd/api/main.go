package main

import (
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"time"
)

func main() {
	db, err := gorm.Open(sqlite.Open("calendar.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&User{}, &Event{}, &Category{})

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.Run(":8080") // localhost:8080
}

type User struct {
	gorm.Model
	Email        string `gorm:"unique"`
	PasswordHash string
}

type Event struct {
	gorm.Model
	UserID      uint
	Title       string
	StartTime   time.Time
	EndTime     time.Time
	Description string
	IsCompleted bool
}

type Category struct {
	gorm.Model
	UserID uint
	Name   string
}
