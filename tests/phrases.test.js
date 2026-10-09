import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cafeSentence,
  locations,
  listening,
  phrases,
  simulations,
} from "../src/data.js";
test("café order generates the requested natural English", () => {
  assert.equal(
    cafeSentence(["latte", "iced", "large", "oat milk", "none", "to go"]),
    "Could I get a large iced latte with oat milk to go, please?",
  );
  assert.equal(
    cafeSentence([
      "latte",
      "hot",
      "medium",
      "regular",
      "an extra shot",
      "here",
    ]),
    "Could I get a medium latte with an extra shot for here, please?",
  );
});
test("all destinations include translated phrases and listening content", () => {
  for (const l of locations) {
    assert.ok(phrases[l.id].length);
    assert.ok(listening[l.id].length);
    for (const [en, ko] of [...phrases[l.id], ...listening[l.id]]) {
      assert.ok(en.length > 3);
      assert.match(ko, /[가-힣]/);
    }
  }
});
test("all required simulations offer complete response choices", () => {
  for (const id of ["immigration", "cafe", "restaurant", "hotel", "shopping"])
    for (const [en, ko, choices] of simulations[id]) {
      assert.ok(en);
      assert.ok(ko);
      assert.ok(choices.length);
      for (const [k, e] of choices) {
        assert.match(k, /[가-힣]/);
        assert.ok(e);
      }
    }
});

test("café decaf choice is reflected without changing existing orders", () => {
  assert.equal(
    cafeSentence([
      "latte",
      "iced",
      "large",
      "oat milk",
      "none",
      "to go",
      "decaf",
    ]),
    "Could I get a large iced decaf latte with oat milk to go, please?",
  );
});
