package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "modernc.org/sqlite"
)

var globalDB *sql.DB

// InitDatabase inicializa la conexión a la base de datos
func InitDatabase() (*sql.DB, error) {
	dataSourceName := getDatabaseURL()

	database, err := sql.Open("sqlite", dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	if err := database.Ping(); err != nil {
		return nil, fmt.Errorf("error pinging database: %w", err)
	}

	globalDB = database
	log.Println("Database connection established successfully")
	return database, nil
}

// GetDB devuelve la instancia global de la base de datos
func GetDB() *sql.DB {
	return globalDB
}

// CloseDB cierra la conexión a la base de datos
func CloseDB() {
	if globalDB != nil {
		if err := globalDB.Close(); err != nil {
			log.Printf("error closing database: %v", err)
		}
		log.Println("Database connection closed")
	}
}

// getDatabaseURL obtiene la URL de la base de datos desde variables de entorno
func getDatabaseURL() string {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		// Usar ruta relativa al directorio del proyecto Go
		dbPath = "./data/app.db"
		// Crear el directorio data si no existe
		if err := os.MkdirAll("./data", 0755); err != nil {
			log.Printf("Warning: Could not create data directory: %v", err)
		}
	}
	return fmt.Sprintf("file:%s?cache=shared&mode=rwc", dbPath)
}

// GetDatabaseURL exporta getDatabaseURL para uso externo
func GetDatabaseURL() string {
	return getDatabaseURL()
}

// Migrate ejecuta las migraciones de la base de datos
func Migrate(database *sql.DB) error {
	log.Println("Running database migrations...")

	// Tabla de servicios turísticos
	_, err := database.Exec(`
		CREATE TABLE IF NOT EXISTS servicios (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nombre TEXT NOT NULL,
			descripcion TEXT NOT NULL,
			precio REAL NOT NULL,
			categoria TEXT NOT NULL,
			destino TEXT NOT NULL,
			duracion_dias INTEGER NOT NULL,
			capacidad_maxima INTEGER DEFAULT 0,
			disponible BOOLEAN DEFAULT 1,
			proveedor TEXT DEFAULT '',
			telefono_contacto TEXT,
			email_contacto TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		return fmt.Errorf("error creating servicios table: %w", err)
	}

	// Tabla de contrataciones de servicios
	_, err = database.Exec(`
		CREATE TABLE IF NOT EXISTS contrataciones (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			servicio_id INTEGER NOT NULL,
			cliente_nombre TEXT NOT NULL,
			cliente_email TEXT NOT NULL,
			cliente_telefono TEXT,
			fecha_contratacion DATETIME DEFAULT CURRENT_TIMESTAMP,
			fecha_inicio DATE NOT NULL,
			fecha_fin DATE NOT NULL,
			num_viajeros INTEGER NOT NULL,
			moneda TEXT NOT NULL DEFAULT 'USD',
			precio_unitario REAL NOT NULL,
			descuento REAL DEFAULT 0,
			total REAL NOT NULL,
			estado TEXT NOT NULL DEFAULT 'pendiente',
			notas TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(servicio_id) REFERENCES servicios(id)
		);
	`)
	if err != nil {
		return fmt.Errorf("error creating contrataciones table: %w", err)
	}

	// Índices para mejorar el rendimiento
	_, err = database.Exec(`
		CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON servicios(categoria);
		CREATE INDEX IF NOT EXISTS idx_servicios_destino ON servicios(destino);
		CREATE INDEX IF NOT EXISTS idx_contrataciones_servicio_id ON contrataciones(servicio_id);
		CREATE INDEX IF NOT EXISTS idx_contrataciones_fecha_inicio ON contrataciones(fecha_inicio);
		-- CREATE INDEX IF NOT EXISTS idx_contrataciones_estado ON contrataciones(estado);
	`)
	if err != nil {
		return fmt.Errorf("error creating indexes: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}
