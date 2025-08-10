package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

type AuthCode struct {
	Code string `json:"code"`
}

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	r := mux.NewRouter()

	r.HandleFunc("/api/token", func(w http.ResponseWriter, r *http.Request) {
		var AuthReq AuthCode
		err := json.NewDecoder(r.Body).Decode(&AuthReq)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		clientID := os.Getenv("VITE_DISCORD_CLIENT_ID")
		clientSecret := os.Getenv("DISCORD_CLIENT_SECRET")

		data := url.Values{}

		data.Set("client_id", clientID)
		data.Set("client_secret", clientSecret)
		data.Set("grant_type", "authorization_code")
		data.Set("code", AuthReq.Code)

		discordReq, err := http.NewRequest("POST", "https://discord.com/api/oauth2/token", strings.NewReader(data.Encode()))
		if err != nil {
			http.Error(w, "Failed to create request", http.StatusInternalServerError)
			return
		}
		discordReq.Header.Add("Content-Type", "application/x-www-form-urlencoded")

		client := &http.Client{}
		discordResp, err := client.Do(discordReq)
		if err != nil {
			http.Error(w, "Failed to execute request to Discord", http.StatusInternalServerError)
			return
		}

		defer discordResp.Body.Close()

		body, err := io.ReadAll(discordResp.Body)
		if err != nil {
			http.Error(w, "Failed to read Discord response", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(discordResp.StatusCode)
		w.Write(body)

	}).Methods("POST")

	log.Println("Starting server on :8080")

	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
