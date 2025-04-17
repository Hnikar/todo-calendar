package models

import (
	"time"
)

// User model
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `json:"name" gorm:"size:50;not null"`
	Email        string    `gorm:"unique;not null;size:255" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"` // Не отдаем хеш клиенту
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"-"`                          // Можно не отдавать клиенту
	Events       []Event   `json:"-" gorm:"foreignKey:UserID"` // Связь с событиями
}

// Event model
type Event struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"` // Индекс для быстрого поиска по пользователю
	CategoryID  *uint     `json:"category_id,omitempty"`         // Указатель, т.к. категория может отсутствовать
	Title       string    `gorm:"not null;size:255" json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `gorm:"not null;index" json:"start_time"` // Индекс для сортировки/фильтрации по времени
	EndTime     time.Time `gorm:"not null" json:"end_time"`
	IsCompleted bool      `gorm:"default:false" json:"is_completed"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"-"`
	// Category    Category  `json:"-" gorm:"foreignKey:CategoryID"` // Опциональная связь для GORM preload
}

// Category model
type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"` // Категории принадлежат пользователям
	Name      string    `gorm:"not null;size:100" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"-"`
	// Events    []Event   `json:"-" gorm:"foreignKey:CategoryID"` // Связь с событиями
}
