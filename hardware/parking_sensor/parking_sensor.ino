// Parkour: one parking-spot sensor (HC-SR04: TRIG on pin 11, ECHO on pin 12).
// Prints   a-1-03,TAKEN   or   a-1-03,OPEN   over USB serial at 9600 baud,
// which is exactly what backend/serial_bridge.py reads.

const int trigPin = 11;
const int echoPin = 12;
const int thresholdCM = 21;      // closer than this = a car is there
bool lastOccupied = false;
int sameReadings = 0;
bool initialized = false;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  digitalWrite(trigPin, LOW);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);

  // no echo = nothing close in front of the sensor = empty
  bool occupied = false;
  if (duration != 0) {
    float distanceCM = duration * 0.0343 / 2.0;
    occupied = distanceCM < thresholdCM;
  }

  if (!initialized || occupied != lastOccupied) {
    sameReadings = 1;
    lastOccupied = occupied;
    initialized = true;
  } else {
    sameReadings++;
  }

  if (sameReadings >= 3) {
    Serial.print("a-1-03,");
    Serial.println(occupied ? "TAKEN" : "OPEN");
  }
  delay(300);
}
