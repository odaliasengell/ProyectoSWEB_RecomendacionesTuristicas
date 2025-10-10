package graphqlschema

import (
	"backend-golang-rest/internal/models"
	"backend-golang-rest/internal/services"
	"time"

	"github.com/graphql-go/graphql"
)

var servicioType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Servicio",
	Fields: graphql.Fields{
		"id":            &graphql.Field{Type: graphql.Int},
		"nombre":        &graphql.Field{Type: graphql.String},
		"descripcion":   &graphql.Field{Type: graphql.String},
		"precio":        &graphql.Field{Type: graphql.Float},
		"categoria":     &graphql.Field{Type: graphql.String},
		"destino":       &graphql.Field{Type: graphql.String},
		"duracion_dias": &graphql.Field{Type: graphql.Int},
	},
})

var contratacionType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Contratacion",
	Fields: graphql.Fields{
		"id":                 &graphql.Field{Type: graphql.Int},
		"servicio_id":        &graphql.Field{Type: graphql.Int},
		"fecha_contratacion": &graphql.Field{Type: graphql.String},
		"fecha_inicio":       &graphql.Field{Type: graphql.String},
		"fecha_fin":          &graphql.Field{Type: graphql.String},
		"num_viajeros":       &graphql.Field{Type: graphql.Int},
		"moneda":             &graphql.Field{Type: graphql.String},
		"total":              &graphql.Field{Type: graphql.Float},
	},
})

func NewSchema() (graphql.Schema, error) {
	queryType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"servicios": &graphql.Field{
				Type: graphql.NewList(servicioType),
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					return services.ListServicios(), nil
				},
			},
			"contrataciones": &graphql.Field{
				Type: graphql.NewList(contratacionType),
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					return services.ListContrataciones(), nil
				},
			},
		},
	})

	mutationType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Mutation",
		Fields: graphql.Fields{
			"createServicio": &graphql.Field{
				Type: servicioType,
				Args: graphql.FieldConfigArgument{
					"nombre":        &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"descripcion":   &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"precio":        &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Float)},
					"categoria":     &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"destino":       &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"duracion_dias": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Int)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					s := models.Servicio{
						Nombre:       p.Args["nombre"].(string),
						Descripcion:  p.Args["descripcion"].(string),
						Precio:       p.Args["precio"].(float64),
						Categoria:    p.Args["categoria"].(string),
						Destino:      p.Args["destino"].(string),
						DuracionDias: p.Args["duracion_dias"].(int),
					}
					id, err := services.CreateServicio(s)
					if err != nil {
						return nil, err
					}
					s.ID = uint(id)
					return s, nil
				},
			},
			"createContratacion": &graphql.Field{
				Type: contratacionType,
				Args: graphql.FieldConfigArgument{
					"servicio_id":  &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Int)},
					"fecha":        &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"fecha_inicio": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"fecha_fin":    &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
					"num_viajeros": &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.Int)},
					"moneda":       &graphql.ArgumentConfig{Type: graphql.NewNonNull(graphql.String)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					c := models.ContratacionServicio{
						ServicioID: uint(p.Args["servicio_id"].(int)),
					}
					t, _ := time.Parse(time.RFC3339, p.Args["fecha"].(string))
					c.FechaContratacion = t
					i, _ := time.Parse(time.RFC3339, p.Args["fecha_inicio"].(string))
					f, _ := time.Parse(time.RFC3339, p.Args["fecha_fin"].(string))
					c.FechaInicio = i
					c.FechaFin = f
					c.NumViajeros = p.Args["num_viajeros"].(int)
					c.Moneda = p.Args["moneda"].(string)
					c.Total = services.CalculateTotal(c.ServicioID, c.NumViajeros, i, f)
					id, err := services.CreateContratacion(c)
					if err != nil {
						return nil, err
					}
					c.ID = uint(id)
					return c, nil
				},
			},
		},
	})

	return graphql.NewSchema(graphql.SchemaConfig{Query: queryType, Mutation: mutationType})
}
