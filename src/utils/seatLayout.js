export function getDisplaySeats(seats, rows, cols, mirror) {
  if (!mirror || cols < 1) return seats;

  const displaySeats = [];
  for (let row = rows - 1; row >= 0; row--) {
    displaySeats.push(...seats.slice(row * cols, row * cols + cols));
  }
  return displaySeats;
}
