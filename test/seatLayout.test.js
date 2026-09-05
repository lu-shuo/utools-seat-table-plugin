import test from "node:test";
import assert from "node:assert/strict";
import { getDisplaySeats } from "../src/utils/seatLayout.js";

const seats = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  row: Math.floor(index / 3) + 1,
  col: (index % 3) + 1,
  studentId: null,
  studentName: null,
}));

test("keeps seats in stored order when mirror is off", () => {
  assert.deepEqual(
    getDisplaySeats(seats, 2, 3, false).map((seat) => seat.id),
    [1, 2, 3, 4, 5, 6],
  );
});

test("shows bottom rows first when mirror is on", () => {
  assert.deepEqual(
    getDisplaySeats(seats, 2, 3, true).map((seat) => seat.id),
    [4, 5, 6, 1, 2, 3],
  );
});
