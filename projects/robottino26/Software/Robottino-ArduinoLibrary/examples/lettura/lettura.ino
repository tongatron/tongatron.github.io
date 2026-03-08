#include <Servo.h>

const uint8_t RGB_RED_PIN = 11;
const uint8_t RGB_GREEN_PIN = 10;
const uint8_t RGB_BLUE_PIN = 9;
const uint8_t BUZZER_PIN = 13;
const uint8_t SERVO_PIN = 8;

const uint8_t ULTRASONIC_TRIG_PIN = 7;
const uint8_t ULTRASONIC_ECHO_PIN = 4;
const uint8_t LDR_RIGHT_PIN = A0;
const uint8_t LDR_LEFT_PIN = A1;

const uint8_t OLED_SDA_PIN = A4;
const uint8_t OLED_SCL_PIN = A5;
const uint8_t OLED_ADDR_WRITE = 0x78; // 0x3C << 1
const uint8_t OLED_WIDTH = 128;
const uint8_t OLED_HEIGHT = 64;

const unsigned long STREAM_INTERVAL_MS = 200;
unsigned long lastStreamMs = 0;
bool triggerWasActive = false;

const int DISTANCE_TRIGGER_CM = 10;
const int LDR_AVG_TRIGGER = 5;

// Melodia condivisa per i due trigger (distanza e LDR).
const uint16_t melodyNotes[] = {523, 659, 784, 1047, 784, 659, 523, 0};
const uint16_t melodyDurationsMs[] = {150, 150, 150, 220, 150, 150, 220, 150};
const uint8_t melodyLength = sizeof(melodyNotes) / sizeof(melodyNotes[0]);

bool melodyPlaying = false;
uint8_t melodyIndex = 0;
unsigned long nextMelodyChangeMs = 0;

Servo headServo;
const int SERVO_CENTER_ANGLE = 90;
const int SERVO_SWING_ANGLE = 12;
const unsigned long SERVO_STEP_INTERVAL_MS = 130;
bool servoDirectionRight = true;
int servoCurrentAngle = SERVO_CENTER_ANGLE;
unsigned long nextServoStepMs = 0;
uint8_t oledBuffer[OLED_WIDTH * (OLED_HEIGHT / 8)];

void playMelodyStep(unsigned long now) {
  uint16_t note = melodyNotes[melodyIndex];
  uint16_t duration = melodyDurationsMs[melodyIndex];

  if (note == 0) {
    noTone(BUZZER_PIN);
  } else {
    tone(BUZZER_PIN, note, duration);
  }

  nextMelodyChangeMs = now + duration;
}

void startMelody(unsigned long now) {
  melodyPlaying = true;
  melodyIndex = 0;
  playMelodyStep(now);
}

void updateMelody(unsigned long now) {
  if (!melodyPlaying || now < nextMelodyChangeMs) return;

  melodyIndex++;
  if (melodyIndex >= melodyLength) {
    melodyPlaying = false;
    noTone(BUZZER_PIN);
    return;
  }

  playMelodyStep(now);
}

void updateServoMotion(unsigned long now) {
  if (melodyPlaying) {
    if (now < nextServoStepMs) return;

    if (servoDirectionRight) {
      servoCurrentAngle = SERVO_CENTER_ANGLE + SERVO_SWING_ANGLE;
    } else {
      servoCurrentAngle = SERVO_CENTER_ANGLE - SERVO_SWING_ANGLE;
    }
    servoDirectionRight = !servoDirectionRight;
    headServo.write(servoCurrentAngle);
    nextServoStepMs = now + SERVO_STEP_INTERVAL_MS;
    return;
  }

  if (servoCurrentAngle != SERVO_CENTER_ANGLE) {
    servoCurrentAngle = SERVO_CENTER_ANGLE;
    headServo.write(servoCurrentAngle);
  }
}

static inline void i2cDelay() {
  delayMicroseconds(4);
}

static inline void sdaHigh() {
  pinMode(OLED_SDA_PIN, INPUT_PULLUP);
}

static inline void sdaLow() {
  pinMode(OLED_SDA_PIN, OUTPUT);
  digitalWrite(OLED_SDA_PIN, LOW);
}

static inline void sclHigh() {
  pinMode(OLED_SCL_PIN, INPUT_PULLUP);
}

static inline void sclLow() {
  pinMode(OLED_SCL_PIN, OUTPUT);
  digitalWrite(OLED_SCL_PIN, LOW);
}

void i2cStart() {
  sdaHigh();
  sclHigh();
  i2cDelay();
  sdaLow();
  i2cDelay();
  sclLow();
}

void i2cStop() {
  sdaLow();
  i2cDelay();
  sclHigh();
  i2cDelay();
  sdaHigh();
  i2cDelay();
}

void i2cWriteBit(bool bitValue) {
  if (bitValue) sdaHigh();
  else sdaLow();
  i2cDelay();
  sclHigh();
  i2cDelay();
  sclLow();
}

bool i2cWriteByte(uint8_t value) {
  for (uint8_t i = 0; i < 8; i++) {
    i2cWriteBit(value & 0x80);
    value <<= 1;
  }

  sdaHigh(); // release SDA for ACK
  i2cDelay();
  sclHigh();
  i2cDelay();
  bool ack = (digitalRead(OLED_SDA_PIN) == LOW);
  sclLow();
  return ack;
}

void oledCommand(uint8_t cmd) {
  i2cStart();
  i2cWriteByte(OLED_ADDR_WRITE);
  i2cWriteByte(0x00); // control byte: command
  i2cWriteByte(cmd);
  i2cStop();
}

void oledInit() {
  oledCommand(0xAE); // display off
  oledCommand(0xD5); oledCommand(0x80);
  oledCommand(0xA8); oledCommand(0x3F);
  oledCommand(0xD3); oledCommand(0x00);
  oledCommand(0x40);
  oledCommand(0x8D); oledCommand(0x14); // charge pump on
  oledCommand(0x20); oledCommand(0x00); // horizontal addressing mode
  oledCommand(0xA1);
  oledCommand(0xC8);
  oledCommand(0xDA); oledCommand(0x12);
  oledCommand(0x81); oledCommand(0xCF);
  oledCommand(0xD9); oledCommand(0xF1);
  oledCommand(0xDB); oledCommand(0x40);
  oledCommand(0xA4);
  oledCommand(0xA6);
  oledCommand(0xAF); // display on
}

void oledAllOn() {
  oledCommand(0x21); oledCommand(0x00); oledCommand(0x7F); // columns 0..127
  oledCommand(0x22); oledCommand(0x00); oledCommand(0x07); // pages 0..7

  i2cStart();
  i2cWriteByte(OLED_ADDR_WRITE);
  i2cWriteByte(0x40); // control byte: data stream
  for (uint16_t i = 0; i < 1024; i++) {
    i2cWriteByte(0xFF); // all pixels on
  }
  i2cStop();
}

void oledClearBuffer() {
  for (uint16_t i = 0; i < sizeof(oledBuffer); i++) {
    oledBuffer[i] = 0x00;
  }
}

void oledSetPixel(uint8_t x, uint8_t y) {
  if (x >= OLED_WIDTH || y >= OLED_HEIGHT) return;
  uint16_t index = x + (y / 8) * OLED_WIDTH;
  oledBuffer[index] |= (1 << (y & 7));
}

void oledFillRect(uint8_t x, uint8_t y, uint8_t w, uint8_t h) {
  for (uint8_t yy = 0; yy < h; yy++) {
    for (uint8_t xx = 0; xx < w; xx++) {
      oledSetPixel(x + xx, y + yy);
    }
  }
}

void oledFlushBuffer() {
  oledCommand(0x21); oledCommand(0x00); oledCommand(0x7F); // columns 0..127
  oledCommand(0x22); oledCommand(0x00); oledCommand(0x07); // pages 0..7

  i2cStart();
  i2cWriteByte(OLED_ADDR_WRITE);
  i2cWriteByte(0x40); // control byte: data stream
  for (uint16_t i = 0; i < sizeof(oledBuffer); i++) {
    i2cWriteByte(oledBuffer[i]);
  }
  i2cStop();
}

void oledShowSmile() {
  oledClearBuffer();

  // Occhi
  oledFillRect(36, 18, 12, 12);
  oledFillRect(80, 18, 12, 12);

  // Bocca a sorriso (curva semplice)
  for (int x = 30; x <= 98; x++) {
    int dx = x - 64;
    int y = 38 + (dx * dx) / 170;
    oledSetPixel((uint8_t)x, (uint8_t)y);
    oledSetPixel((uint8_t)x, (uint8_t)(y + 1));
  }

  oledFlushBuffer();
}

int readDistanceCm() {
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG_PIN, LOW);

  unsigned long durationUs = pulseIn(ULTRASONIC_ECHO_PIN, HIGH, 30000);
  if (durationUs == 0) return -1;
  return (int)(durationUs / 58);
}

void setup() {
  Serial.begin(115200);

  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);

  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);
  pinMode(LDR_RIGHT_PIN, INPUT);
  pinMode(LDR_LEFT_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  headServo.attach(SERVO_PIN);
  headServo.write(SERVO_CENTER_ANGLE);

  // Comportamento "reset": LED RGB blu
  digitalWrite(RGB_RED_PIN, LOW);
  digitalWrite(RGB_GREEN_PIN, LOW);
  digitalWrite(RGB_BLUE_PIN, HIGH);

  // Comportamento "reset": OLED con sorriso
  sdaHigh();
  sclHigh();
  oledInit();
  oledShowSmile();
}

void loop() {
  unsigned long now = millis();
  updateMelody(now);
  updateServoMotion(now);

  if (now - lastStreamMs < STREAM_INTERVAL_MS) {
    return;
  }
  lastStreamMs = now;

  int distanceCm = readDistanceCm();
  int ldrRight = analogRead(LDR_RIGHT_PIN);
  int ldrLeft = analogRead(LDR_LEFT_PIN);
  int ldrAvg = (ldrRight + ldrLeft) / 2;

  bool triggerActive =
    ((distanceCm >= 0) && (distanceCm < DISTANCE_TRIGGER_CM)) ||
    (ldrAvg < LDR_AVG_TRIGGER);

  if (triggerActive && !triggerWasActive && !melodyPlaying) {
    startMelody(now);
  }
  triggerWasActive = triggerActive;

  Serial.print("{\"t\":");
  Serial.print(now);
  Serial.print(",\"distance_cm\":");
  Serial.print(distanceCm);
  Serial.print(",\"ldr_right\":");
  Serial.print(ldrRight);
  Serial.print(",\"ldr_left\":");
  Serial.print(ldrLeft);
  Serial.print(",\"ldr_avg\":");
  Serial.print(ldrAvg);
  Serial.println("}");
}
