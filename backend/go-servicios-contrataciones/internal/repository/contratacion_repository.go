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

func FetchContrataciones() []models.ContratacionServicio {
	database := db.Get()
	if database == nil {
		return []models.ContratacionServicio{}
	}

	collection := database.Collection("contrataciones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{bson.E{Key: "_id", Value: 1}}))
	if err != nil {
		fmt.Printf("Error al buscar contrataciones: %v\n", err)
		return []models.ContratacionServicio{}
	}
	defer cursor.Close(ctx)

	var contrataciones []models.ContratacionServicio
	if err = cursor.All(ctx, &contrataciones); err != nil {
		fmt.Printf("Error al decodificar contrataciones: %v\n", err)
		return []models.ContratacionServicio{}
	}

	return contrataciones
}

func GetContratacionByID(id primitive.ObjectID) (*models.ContratacionServicio, error) {
	database := db.Get()
	if database == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("contrataciones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var contratacion models.ContratacionServicio
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&contratacion)
	if err != nil {
		return nil, fmt.Errorf("contratacion not found: %v", err)
	}

	return &contratacion, nil
}

func CreateContratacion(c models.ContratacionServicio) (primitive.ObjectID, error) {
	database := db.Get()
	if database == nil {
		return primitive.NilObjectID, fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("contrataciones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Asignar timestamps
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()

	result, err := collection.InsertOne(ctx, c)
	if err != nil {
		return primitive.NilObjectID, err
	}

	id := result.InsertedID.(primitive.ObjectID)
	return id, nil
}

func UpdateContratacion(id primitive.ObjectID, c models.ContratacionServicio) error {
	database := db.Get()
	if database == nil {
		return fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("contrataciones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"servicio_id":        c.ServicioID,
			"fecha_contratacion": c.FechaContratacion,
			"fecha_inicio":       c.FechaInicio,
			"fecha_fin":          c.FechaFin,
			"num_viajeros":       c.NumViajeros,
			"moneda":             c.Moneda,
			"total":              c.Total,
			"updated_at":         time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return fmt.Errorf("contratacion not found")
	}

	return nil
}

func DeleteContratacion(id primitive.ObjectID) error {
	database := db.Get()
	if database == nil {
		return fmt.Errorf("database connection is nil")
	}

	collection := database.Collection("contrataciones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("contratacion not found")
	}

	return nil
}
