#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "C14";
const char* password = "supertheiler";

WiFiClient client;

const ESP8266WebServer server(80);
const int httpPort = 3000;

const int led = 13;
String url;

HTTPClient http;

void setup(void){
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".9");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  Serial.println("Setup complete");
  randomSeed(ESP.getCycleCount());
  int r = random(10000, 99999); 
  String sequence=String(r);
  sequence="10000";
  url = "http://192.168.1.39:3000/api/addMeasurement/wemos02/DeepSleep60/"+sequence;
  
  http.begin(url); //HTTP
  int httpCode = http.GET();
  Serial.println("[HTTP] GET "+String(httpCode));
  http.end(); 
 
  ESP.deepSleep(60 * 1000000);
}

void loop(void){


}
