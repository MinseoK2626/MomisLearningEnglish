import { test } from "node:test";
import assert from "node:assert/strict";
import {
  airportSituations,
  airportDefaults,
  immigrationQuestions,
  immigrationDefaults,
  immigrationAnswers,
  extraBuilders,
  formatDate,
} from "../src/builders.js";
function validAnswers(answers) {
  assert.ok(answers.length);
  for (const p of answers) {
    assert.equal(typeof p.en, "string");
    assert.equal(typeof p.ko, "string");
    assert.ok(p.en.length > 5);
    assert.match(p.ko, /[가-힣]/);
    assert.doesNotMatch(p.en, /undefined|null|custom/);
  }
}
test("all ten airport situations and every preset selection generate meaningful translated answers", () => {
  assert.equal(airportSituations.length, 10);
  for (const q of airportSituations) {
    validAnswers(q.generate(airportDefaults));
    for (const f of q.fields)
      for (const o of f.options || []) {
        const state = { ...airportDefaults, [f.key]: o.en, cityText: "Boston" };
        validAnswers(q.generate(state));
      }
  }
});
test("airport seat, baggage characteristics, gate directions and custom city are reflected accurately", () => {
  const get = (id) => airportSituations.find((q) => q.id === id);
  assert.equal(
    get("checkin").generate({ ...airportDefaults, seat: "aisle", bags: "2" })[1]
      .en,
    "Could I have an aisle seat, please?",
  );
  assert.equal(
    get("checkin").generate({ ...airportDefaults, seat: "aisle", bags: "2" })[2]
      .en,
    "I'd like to check these two bags.",
  );
  assert.equal(
    get("gate").generate({
      ...airportDefaults,
      gate: "B12",
      direction: "time",
    })[0].en,
    "How long does it take to get to Gate B12?",
  );
  assert.equal(
    get("lost").generate({
      ...airportDefaults,
      bagColor: "red",
      bagSize: "small",
    })[1].en,
    "It's a small red suitcase.",
  );
  assert.deepEqual(
    get("checkin").generate({
      ...airportDefaults,
      city: "custom",
      cityText: "",
    }),
    [],
  );
  assert.match(
    get("checkin").generate({
      ...airportDefaults,
      city: "custom",
      cityText: "Boston",
    })[0].en,
    /Boston/,
  );
});
test("all ten immigration questions and preset answers remain valid", () => {
  assert.equal(immigrationQuestions.length, 10);
  for (const q of immigrationQuestions) {
    validAnswers(q.generate(immigrationDefaults));
    for (const f of q.fields)
      for (const o of f.options || []) {
        const state = {
          ...immigrationDefaults,
          [f.key]: o.en,
          regionText: "Texas",
          daughterRegionText: "Boston",
          arrival: "2026-10-08",
          departure: "2026-10-22",
          returnDate: "2026-10-22",
        };
        validAnswers(q.generate(state));
      }
  }
  assert.equal(immigrationAnswers(immigrationDefaults).length, 12);
});
test("custom travel dates require a valid positive stay and format deterministically", () => {
  const stay = immigrationQuestions.find((q) => q.id === "stay");
  assert.equal(formatDate("2026-02-30"), "");
  assert.equal(formatDate("2026-10-22"), "October 22, 2026");
  assert.deepEqual(
    stay.generate({
      ...immigrationDefaults,
      duration: "custom",
      arrival: "2026-10-22",
      departure: "2026-10-08",
    }),
    [],
  );
  assert.equal(
    stay.generate({
      ...immigrationDefaults,
      duration: "custom",
      arrival: "2026-10-08",
      departure: "2026-10-22",
    })[0].en,
    "I'll be staying for 14 days, until October 22, 2026.",
  );
});
test("hotel, transport, shopping, souvenirs, and emergency options generate grammatical requests", () => {
  for (const b of Object.values(extraBuilders)) {
    validAnswers(b.generate(b.defaults));
    for (const f of b.fields)
      for (const o of f.options || [])
        validAnswers(b.generate({ ...b.defaults, [f.key]: o.en }));
  }
  assert.equal(
    extraBuilders.hotel.generate({
      ...extraBuilders.hotel.defaults,
      hotelTask: "request",
      quantity: "one",
      hotelItem: "towels",
    })[0].en,
    "Could I get one extra towel, please?",
  );
});
