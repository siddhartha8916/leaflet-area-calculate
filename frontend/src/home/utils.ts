import * as turf from "@turf/turf";

export function roundTo5DecimalPlaces(number: number | null) {
  if (number) {
    return Math.round(number * 100000) / 100000;
  }
  return null;
}

export function calculateSideLengths(
  positions: GeolocationPosition[]
): number[] {
  const sidesLength: number[] = [];

  for (let i = 1; i < positions.length; i++) {
    const lastPosition = positions[i - 1];
    const currentPosition = positions[i];

    // Calculate the base distance (horizontal distance) between two positions
    const base = turf.distance(
      [lastPosition.coords.latitude, lastPosition.coords.longitude],
      [currentPosition.coords.latitude, currentPosition.coords.longitude],
      { units: "meters" }
    );

    // Round the base distance to 2 decimal places
    const baseRoundedToTwoDecimal = Math.round(base * 100) / 100;

    // Calculate the altitude difference between the two points
    const height =
      (currentPosition.coords.altitude || 0) -
      (lastPosition.coords.altitude || 0);

    // Round the height (altitude difference) to 2 decimal places
    const heightRoundedToTwoDecimal = Math.round(height * 100) / 100;

    // Calculate the hypotenuse (side length) using the Pythagorean theorem
    const hypotenuse = Math.sqrt(
      baseRoundedToTwoDecimal ** 2 + heightRoundedToTwoDecimal ** 2
    );

    // Push the calculated hypotenuse to the sidesLength array
    sidesLength.push(hypotenuse);
  }

  return sidesLength;
}

export function calculatePolygonArea(positions: GeolocationPosition[]): number {
  const sidesLength: number[] = [];
  const angles: number[] = [];

  // Calculate the side lengths and angles
  for (let i = 1; i < positions.length; i++) {
    const lastPosition = positions[i - 1];
    const currentPosition = positions[i];

    // Calculate the base distance (horizontal distance) between two positions
    const base = turf.distance(
      [lastPosition.coords.latitude, lastPosition.coords.longitude],
      [currentPosition.coords.latitude, currentPosition.coords.longitude],
      { units: "meters" }
    );

    // Round the base distance to 2 decimal places
    const baseRoundedToTwoDecimal = Math.round(base * 100) / 100;

    // Calculate the altitude difference between the two points
    const height =
      (currentPosition.coords.altitude || 0) -
      (lastPosition.coords.altitude || 0);

    // Round the height (altitude difference) to 2 decimal places
    const heightRoundedToTwoDecimal = Math.round(height * 100) / 100;

    // Calculate the hypotenuse (side length) using the Pythagorean theorem
    const hypotenuse = Math.sqrt(
      baseRoundedToTwoDecimal ** 2 + heightRoundedToTwoDecimal ** 2
    );
    sidesLength.push(hypotenuse);

    // Calculate the angle in radians using arctangent (inverse tangent)
    const angleRadians = Math.atan2(
      heightRoundedToTwoDecimal,
      baseRoundedToTwoDecimal
    );
    const angleDegrees = angleRadians * (180 / Math.PI);
    angles.push(angleDegrees);
  }

  let area = 0;

  // Calculate the area of the polygon using the triangle area formula (for each pair of sides)
  for (let i = 0; i < sidesLength.length - 1; i++) {
    const s1 = sidesLength[i];
    const s2 = sidesLength[i + 1];

    // Calculate the area of the triangle using the formula:
    // A = 1/2 * s1 * s2 * sin(angle)
    const areaOfTriangle =
      0.5 * s1 * s2 * Math.sin(angles[i] * (Math.PI / 180));
    area += areaOfTriangle;
  }

  return area;
}
