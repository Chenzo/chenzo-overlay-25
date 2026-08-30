const randomBetween = (min, max) => Math.random() * (max - min) + min;

// Same ranges as the original wonky-background.ts port — random offsets/corner points/rotations
// that together describe one irregular "wonky" quadrilateral.
export function generateWonkyValues() {
  return {
    top: randomBetween(-4, -12),
    right: randomBetween(-4, -16),
    bottom: randomBetween(-6, -18),
    left: randomBetween(-4, -12),

    tlX: randomBetween(0, 5),
    tlY: randomBetween(0, 4),
    trX: randomBetween(95, 100),
    trY: randomBetween(0, 5),
    brX: randomBetween(94, 100),
    brY: randomBetween(95, 100),
    blX: randomBetween(0, 6),
    blY: randomBetween(94, 100),

    rotate: randomBetween(-1.2, 1.2),
    outlineRotate: randomBetween(-2.2, 2.2),
    hoverRotate: randomBetween(-2.5, 2.5),
  };
}
