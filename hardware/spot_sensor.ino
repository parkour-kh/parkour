// Parkour: one parking-spot sensor.
// ASSUMES an HC-SR04-style ultrasonic distance sensor (4 pins: VCC, TRIG, ECHO, GND),
// which is what the SparkFun Inventor's Kit ships with. Check your kit's wiring.
//
// Wiring:  VCC -> 5V   GND -> GND   TRIG -> pin 9   ECHO -> pin 10
// Output over USB serial every time the state changes (and once a few seconds):
//   a-1-03,TAKEN      or      a-1-03,OPEN
// Mount the sensor facing where the car's bumper/front will be.

const char* SPOT_ID = "a-1-03";   // must exist in backend/data/parking.json
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int TAKEN_BELOW_CM = 40;    // closer than this = a car is there. Tune it on your table.
const int CONFIRM_READINGS = 5;   // need this many matching readings in a row before we switch state
const unsigned long REPORT_EVERY_MS = 5000;

bool taken = false;
int streak = 0;
unsigned long lastReport = 0;

long readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long us = pulseIn(ECHO_PIN, HIGH, 30000UL);   // 30 ms timeout = nothing in range
  if (us == 0) return 999;                      // no echo -> treat as far away
  return us / 58;                               // microseconds -> centimeters
}

void report() {
  Serial.print(SPOT_ID);
  Serial.print(",");
  Serial.println(taken ? "TAKEN" : "OPEN");
  lastReport = millis();
}

void setup() {
  Serial.begin(9600);                           // the bridge reads at 9600 baud
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  delay(500);
  report();
}

void loop() {
  bool looksTaken = readDistanceCm() < TAKEN_BELOW_CM;

  if (looksTaken != taken) {
    streak++;                                   // debounce: a hand waving past won't flip it
    if (streak >= CONFIRM_READINGS) {
      taken = looksTaken;
      streak = 0;
      report();
    }
  } else {
    streak = 0;
  }

  if (millis() - lastReport > REPORT_EVERY_MS) report();   // heartbeat so the bridge can resync
  delay(100);
}
