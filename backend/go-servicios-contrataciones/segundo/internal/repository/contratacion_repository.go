package repository

import (
	"backend-golang-rest/internal/db"
	"backend-golang-rest/internal/models"
	"time"
)

func FetchContrataciones() []models.ContratacionServicio {
	database := db.Get()
	if database == nil {
		return []models.ContratacionServicio{}
	}
	rows, err := database.Query("SELECT id, servicio_id, fecha_contratacion, fecha_inicio, fecha_fin, num_viajeros, moneda, total FROM contrataciones ORDER BY id")
	if err != nil {
		return []models.ContratacionServicio{}
	}
	defer rows.Close()

	var contrataciones []models.ContratacionServicio
	for rows.Next() {
		var c models.ContratacionServicio
		var fecha, inicio, fin string
		if err := rows.Scan(&c.ID, &c.ServicioID, &fecha, &inicio, &fin, &c.NumViajeros, &c.Moneda, &c.Total); err != nil {
			continue
		}
		// Fecha almacenada como texto ISO8601
		c.FechaContratacion, _ = time.Parse(time.RFC3339, fecha)
		c.FechaInicio, _ = time.Parse(time.RFC3339, inicio)
		c.FechaFin, _ = time.Parse(time.RFC3339, fin)
		contrataciones = append(contrataciones, c)
	}
	return contrataciones
}

func CreateContratacion(c models.ContratacionServicio) (uint, error) {
	database := db.Get()
	if database == nil {
		return 0, nil
	}
	fecha := c.FechaContratacion.UTC().Format(time.RFC3339)
	inicio := c.FechaInicio.UTC().Format(time.RFC3339)
	fin := c.FechaFin.UTC().Format(time.RFC3339)
	res, err := database.Exec("INSERT INTO contrataciones (servicio_id, fecha_contratacion, fecha_inicio, fecha_fin, num_viajeros, moneda, total) VALUES (?,?,?,?,?,?,?)", c.ServicioID, fecha, inicio, fin, c.NumViajeros, c.Moneda, c.Total)
	if err != nil {
		return 0, err
	}
	id, _ := res.LastInsertId()
	return uint(id), nil
}
