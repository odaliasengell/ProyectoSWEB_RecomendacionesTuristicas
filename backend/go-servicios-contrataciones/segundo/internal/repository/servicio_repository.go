package repository

import (
	"backend-golang-rest/internal/db"
	"backend-golang-rest/internal/models"
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

func CreateServicio(s models.Servicio) (uint, error) {
	database := db.Get()
	if database == nil {
		return 0, nil
	}
	res, err := database.Exec("INSERT INTO servicios (nombre, descripcion, precio, categoria, destino, duracion_dias) VALUES (?,?,?,?,?,?)", s.Nombre, s.Descripcion, s.Precio, s.Categoria, s.Destino, s.DuracionDias)
	if err != nil {
		return 0, err
	}
	id, _ := res.LastInsertId()
	return uint(id), nil
}
