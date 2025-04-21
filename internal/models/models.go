package models

import (
	"time"
)

// User model
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name" gorm:"size:50;not null"`
	Email        string    `gorm:"unique;not null;size:255" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"-"`
	Events       []Event   `json:"-" gorm:"foreignKey:UserID"`
}

// Event model
type Event struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	CategoryID  *uint     `json:"-"`
	Title       string    `gorm:"not null;size:255" json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `gorm:"not null;index" json:"-"`
	EndTime     time.Time `gorm:"not null" json:"-"`
	AllDay      bool      `gorm:"default:false" json:"allDay"`
	IsCompleted bool      `gorm:"default:false" json:"completed"`
	Priority    string    `gorm:"size:50" json:"priority,omitempty"`
	ClassName   string    `gorm:"size:100" json:"className,omitempty"`
	CreatedAt   time.Time `json:"-"`
	UpdatedAt   time.Time `json:"-"`
}

// Category model
type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Name      string    `gorm:"not null;size:100" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"-"`
}
