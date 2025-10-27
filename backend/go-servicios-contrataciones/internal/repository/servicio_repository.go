package repository

import (
	"backend-golang-rest/internal/db"
	"backend-golang-rest/internal/models"
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func FetchServicios() []models.Servicio {
	fmt.Println("DEBUG: FetchServicios iniciado")
	database := db.Get()
	fmt.Printf("DEBUG: database = %v\n", database)
	if database == nil {
		fmt.Println("DEBUG: database es nil, retornando array vacío")
		return []models.Servicio{}
	}

	collection := database.Collection("servicios")
	fmt.Printf("DEBUG: collection obtenida: %v\n", collection)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	fmt.Println("DEBUG: Ejecutando Find...")
	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{bson.E{Key: "_id", Value: 1}}))
	if err != nil {
		fmt.Printf("Error al buscar servicios: %v\n", err)
		return []models.Servicio{}
	}
	defer cursor.Close(ctx)

	fmt.Println("DEBUG: Decodificando resultados...")
	var servicios []models.Servicio
	if err = cursor.All(ctx, &servicios); err != nil {
		fmt.Printf("Error al decodificar servicios: %v\n", err)
		return []models.Servicio{}
	}

	fmt.Printf("DEBUG: %d servicios encontrados\n", len(servicios))
	return servicios
}

func GetServicioByID(id primitive.ObjectID) (*models.Servicio, error) {
	database := db.Get()
	if database == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("servicios")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var servicio models.Servicio
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&servicio)
	if err != nil {
		return nil, fmt.Errorf("servicio not found: %v", err)
	}

	return &servicio, nil
}

func CreateServicio(s models.Servicio) (primitive.ObjectID, error) {
	database := db.Get()
	if database == nil {
		return primitive.NilObjectID, fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("servicios")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Asignar timestamps
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()

	fmt.Printf("DEBUG: Creando servicio: %+v\n", s)

	result, err := collection.InsertOne(ctx, s)
	if err != nil {
		fmt.Printf("DEBUG: Error en InsertOne: %v\n", err)
		return primitive.NilObjectID, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	fmt.Printf("DEBUG: ID generado: %s\n", id.Hex())
	return id, nil
}

func UpdateServicio(id primitive.ObjectID, s models.Servicio) error {
	database := db.Get()
	if database == nil {
		return fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("servicios")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Actualizar timestamp
	update := bson.M{
		"$set": bson.M{
			"nombre":            s.Nombre,
			"descripcion":       s.Descripcion,
			"precio":            s.Precio,
			"categoria":         s.Categoria,
			"destino":           s.Destino,
			"duracion_dias":     s.DuracionDias,
			"capacidad_maxima":  s.CapacidadMaxima,
			"disponible":        s.Disponible,
			"proveedor":         s.Proveedor,
			"telefono_contacto": s.TelefonoContacto,
			"email_contacto":    s.EmailContacto,
			"updated_at":        time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("servicio not found")
	}

	return nil
}

func DeleteServicio(id primitive.ObjectID) error {
	database := db.Get()
	if database == nil {
		return fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("servicios")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("servicio not found")
	}

	return nil
}
