package repository

import (
	"backend-golang-rest/internal/db"
	"backend-golang-rest/internal/models"
	"fmt"
)

func FetchServicios() []models.Servicio {
	database := db.Get()
	if database == nil {
		return []models.Servicio{}
	}
	rows, err := database.Query("SELECT id, nombre, descripcion, precio, categoria, destino, duracion_dias FROM servicios ORDER BY id")
	if err != nil {
		return []models.Servicio{}
	}
	defer rows.Close()

	var servicios []models.Servicio
	for rows.Next() {
		var s models.Servicio
		if err := rows.Scan(&s.ID, &s.Nombre, &s.Descripcion, &s.Precio, &s.Categoria, &s.Destino, &s.DuracionDias); err != nil {
			continue
		}
		servicios = append(servicios, s)
	}
	return servicios
}

func GetServicioByID(id uint) (*models.Servicio, error) {
	database := db.Get()
	if database == nil {
		return nil, fmt.Errorf("database connection is nil")
	}
	
	var s models.Servicio
	row := database.QueryRow("SELECT id, nombre, descripcion, precio, categoria, destino, duracion_dias FROM servicios WHERE id = ?", id)
	
	err := row.Scan(&s.ID, &s.Nombre, &s.Descripcion, &s.Precio, &s.Categoria, &s.Destino, &s.DuracionDias)
	if err != nil {
		return nil, fmt.Errorf("servicio not found")
	}
	
	return &s, nil
}

func CreateServicio(s models.Servicio) (uint, error) {
	database := db.Get()
	if database == nil {
		return 0, fmt.Errorf("database connection is nil")
	}
	
	fmt.Printf("DEBUG: Creando servicio: %+v\n", s)
	
	res, err := database.Exec("INSERT INTO servicios (nombre, descripcion, precio, categoria, destino, duracion_dias) VALUES (?,?,?,?,?,?)", s.Nombre, s.Descripcion, s.Precio, s.Categoria, s.Destino, s.DuracionDias)
	if err != nil {
		fmt.Printf("DEBUG: Error en INSERT: %v\n", err)
		return 0, err
	}
	
	id, err := res.LastInsertId()
	if err != nil {
		fmt.Printf("DEBUG: Error getting LastInsertId: %v\n", err)
		return 0, err
	}
	
	fmt.Printf("DEBUG: ID generado: %d\n", id)
	return uint(id), nil
}
