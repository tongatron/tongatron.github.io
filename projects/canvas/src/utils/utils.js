export function smoothstep(t) {
	return t * t * (3 - 2 * t);
}

export function keyframeValue(progress) {
	const KEYFRAMES = [
		{ x: 0, y: 0, z: 0, roll: 0 },
		{ x: 20, y: -2, z: -10, roll: 0.22 },
		{ x: -15, y: 10, z: -5, roll: -0.22 },
		{ x: 0, y: 0, z: 0, roll: 0 },
	];

	const segments = KEYFRAMES.length - 1;
	const scaled = progress * segments;
	const idx = Math.min(Math.floor(scaled), segments - 1);
	const t = smoothstep(scaled - idx);
	const a = KEYFRAMES[idx];
	const b = KEYFRAMES[idx + 1];
	return {
		x: a.x + (b.x - a.x) * t,
		y: a.y + (b.y - a.y) * t,
		z: a.z + (b.z - a.z) * t,
		roll: a.roll + (b.roll - a.roll) * t,
	};
}
