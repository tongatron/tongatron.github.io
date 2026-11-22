// made by tools/build.py: the emulator's parts (fm1.toml emu) and the app's own part of the page
import { compose } from "./parts/parts.js";
import * as midi from "./parts/midi.js";
import * as port from "./parts/port.js";
const own = {};
export const { attach, message } = compose({ midi, port }, own, { id: "keyschool", name: "KEYSCHOOL", backupExt: "bak" });
