const uint8_t RGB_RED_PIN = 11;
const uint8_t RGB_GREEN_PIN = 10;
const uint8_t RGB_BLUE_PIN = 9;

const uint8_t OLED_SDA_PIN = A4;
const uint8_t OLED_SCL_PIN = A5;
const uint8_t OLED_ADDR_WRITE = 0x78; // 0x3C << 1

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

void setup() {
  // LED RGB: blu fisso
  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);
  digitalWrite(RGB_RED_PIN, LOW);
  digitalWrite(RGB_GREEN_PIN, LOW);
  digitalWrite(RGB_BLUE_PIN, HIGH);

  // OLED: inizializza e accende tutti i pixel
  sdaHigh();
  sclHigh();
  oledInit();
  oledAllOn();
}

void loop() {}
