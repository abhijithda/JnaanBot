package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

const (
	myURL     = "" // "http://localhost"
	mySite    = myURL + port + "/"
	port      = ":8008"
	greetPath = "greet"
	jsonPath  = "json"
	yamlPath  = "yaml"
)

func getOrder() map[string]string {
	data := map[string]string{
		"time": time.Now().Format(time.UnixDate),
		"day":  string(time.Now().Weekday()),
	}
	return data
}
func greet(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(`
		<h1> Jai Jinendra </h1>
		<a href=` + myURL + greetPath + `>greet</a>
		<br>
		<a href=` + myURL + jsonPath + `>json</a>
		<br>
		<a href=` + myURL + yamlPath + `>yaml</a>
		<br>
		`))
		return
	} else if r.URL.Path == "/greet" {
		fmt.Fprintf(w, "Hello World! %s", time.Now())
	} else if r.URL.Path == "/json" {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		data := getOrder()
		jsonData, err := json.Marshal(data)
		if err != nil {
			fmt.Println(err.Error())
		}
		fmt.Fprintf(w, string(jsonData))
		return
	} else if r.URL.Path == "/yaml" {
		w.Header().Set("Content-Type", "text/yaml; charset=utf-8")
		fmt.Fprintf(w, `
---
    "time": "%s"
    -  test: ok
...
`,
			time.Now())
		return
	}
	fmt.Fprintf(w, "\n\nTimestamp: %s", time.Now())
	return
}

func main() {
	log.Println("Entering main with", os.Args[:])

	http.HandleFunc("/", greet)
	http.ListenAndServe(port, nil)
}
