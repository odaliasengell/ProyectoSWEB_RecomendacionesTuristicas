package main

import (
	"fmt"
	"net/http"
	"log"
)

func ping(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "pong")
}

func main() {
	http.HandleFunc("/ping", ping)
	fmt.Println("Test server listening on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}