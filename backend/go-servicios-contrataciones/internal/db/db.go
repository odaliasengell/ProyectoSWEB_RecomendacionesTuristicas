package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

var globalDB *sql.DB

func Init(dataSourceName string) (*sql.DB, error) {
	database, err := sql.Open("sqlite", dataSourceName)
	if err != nil {
		return nil, err
	}
	if err := database.Ping(); err != nil {
		return nil, err
	}
	globalDB = database
	return database, nil
}

func Get() *sql.DB {
	return globalDB
}

func Close() {
	if globalDB != nil {
		if err := globalDB.Close(); err != nil {
			log.Printf("error closing db: %v", err)
		}
	}
}

func Migrate(database *sql.DB) error {
	_, err := database.Exec(`
		CREATE TABLE IF NOT EXISTS servicios (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre TEXT NOT NULL,
			descripcion TEXT NOT NULL,
            precio REAL NOT NULL,
            categoria TEXT NOT NULL,
            destino TEXT NOT NULL,
            duracion_dias INTEGER NOT NULL
		);
	`)
	if err != nil {
		return err
	}
	_, err = database.Exec(`
		CREATE TABLE IF NOT EXISTS contrataciones (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			servicio_id INTEGER NOT NULL,
            fecha_contratacion TEXT NOT NULL,
            fecha_inicio TEXT NOT NULL,
            fecha_fin TEXT NOT NULL,
            num_viajeros INTEGER NOT NULL,
            moneda TEXT NOT NULL,
            total REAL NOT NULL,
			FOREIGN KEY(servicio_id) REFERENCES servicios(id)
		);
	`)
	if err != nil {
		return err
	}

	// Backfill columns for existing deployments (SQLite lacks IF NOT EXISTS for columns)
	if err := ensureColumn(database, "servicios", "categoria", "TEXT", ""); err != nil {
		return err
	}
	if err := ensureColumn(database, "servicios", "destino", "TEXT", ""); err != nil {
		return err
	}
	if err := ensureColumn(database, "servicios", "duracion_dias", "INTEGER", "0"); err != nil {
		return err
	}

	if err := ensureColumn(database, "contrataciones", "fecha_inicio", "TEXT", ""); err != nil {
		return err
	}
	if err := ensureColumn(database, "contrataciones", "fecha_fin", "TEXT", ""); err != nil {
		return err
	}
	if err := ensureColumn(database, "contrataciones", "num_viajeros", "INTEGER", "0"); err != nil {
		return err
	}
	if err := ensureColumn(database, "contrataciones", "moneda", "TEXT", ""); err != nil {
		return err
	}
	if err := ensureColumn(database, "contrataciones", "total", "REAL", "0"); err != nil {
		return err
	}

	return nil
}

func ensureColumn(database *sql.DB, table, column, typeName, defaultValue string) error {
	exists := false
	rows, err := database.Query("PRAGMA table_info(" + table + ")")
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var cid int
		var name, ctype string
		var notnull, pk int
		var dflt interface{}
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dflt, &pk); err != nil {
			return err
		}
		if name == column {
			exists = true
			break
		}
	}
	if exists {
		return nil
	}
	stmt := fmt.Sprintf("ALTER TABLE %s ADD COLUMN %s %s", table, column, typeName)
	if defaultValue != "" {
		stmt = stmt + " DEFAULT '" + defaultValue + "'"
	}
	_, err = database.Exec(stmt)
	return err
}
