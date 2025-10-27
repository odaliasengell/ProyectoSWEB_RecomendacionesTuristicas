package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var globalClient *mongo.Client
var globalDB *mongo.Database

// Init inicializa la conexión a MongoDB
func Init(mongoURI, databaseName string) (*mongo.Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, err
	}

	// Verificar la conexión
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	globalClient = client
	globalDB = client.Database(databaseName)

	log.Println("✅ Conectado a MongoDB exitosamente")
	return globalDB, nil
}

// Get retorna la instancia de la base de datos
func Get() *mongo.Database {
	return globalDB
}

// GetClient retorna el cliente de MongoDB
func GetClient() *mongo.Client {
	return globalClient
}

// Close cierra la conexión a MongoDB
func Close() {
	if globalClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := globalClient.Disconnect(ctx); err != nil {
			log.Printf("error cerrando conexión a MongoDB: %v", err)
		} else {
			log.Println("❌ Conexión a MongoDB cerrada")
		}
	}
}

// CreateIndexes crea los índices necesarios para las colecciones
func CreateIndexes() error {
	if globalDB == nil {
		log.Println("⚠️ globalDB es nil, saltando creación de índices")
		return nil
	}

	ctx := context.Background()

	// Índices para la colección servicios
	serviciosCollection := globalDB.Collection("servicios")
	_, err := serviciosCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: map[string]interface{}{"nombre": 1},
		},
		{
			Keys: map[string]interface{}{"categoria": 1},
		},
		{
			Keys: map[string]interface{}{"destino": 1},
		},
	})
	if err != nil {
		return err
	}

	// Índices para la colección contrataciones
	contratacionesCollection := globalDB.Collection("contrataciones")
	_, err = contratacionesCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: map[string]interface{}{"servicio_id": 1},
		},
		{
			Keys: map[string]interface{}{"fecha_contratacion": 1},
		},
	})
	if err != nil {
		return err
	}

	log.Println("✅ Índices de MongoDB creados exitosamente")
	return nil
}
