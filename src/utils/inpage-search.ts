export interface TextMatchRange {
	start: number;
	end: number;
}

/**
 * Finds literal, non-overlapping matches using JavaScript's default Unicode
 * lowercase conversion (not locale-aware full case folding).
 */
export function findCaseInsensitiveRanges(text: string, query: string): TextMatchRange[] {
	const lowerText = text.toLowerCase();
	const lowerQuery = query.toLowerCase();
	if (!lowerQuery) return [];

	const sourceStarts: number[] = [];
	const sourceEnds: number[] = [];
	let sourceOffset = 0;
	let lowerOffset = 0;

	// A lowercase mapping can expand a source code point (for example, İ -> i + ◌̇).
	// Map each folded UTF-16 unit back to the complete original code point.
	for (const codePoint of text) {
		const sourceEnd = sourceOffset + codePoint.length;
		const lowerWidth = codePoint.toLowerCase().length;
		for (let index = 0; index < lowerWidth; index++) {
			sourceStarts[lowerOffset + index] = sourceOffset;
			sourceEnds[lowerOffset + index] = sourceEnd;
		}
		sourceOffset = sourceEnd;
		lowerOffset += lowerWidth;
	}

	// Whole-string lowercase can be contextual; fail closed if per-code-point widths differ.
	if (lowerOffset !== lowerText.length) return [];

	const ranges: TextMatchRange[] = [];
	let searchFrom = 0;
	let matchAt = lowerText.indexOf(lowerQuery, searchFrom);
	while (matchAt !== -1) {
		const matchEnd = matchAt + lowerQuery.length - 1;
		const start = sourceStarts[matchAt];
		const end = sourceEnds[matchEnd];
		if (start === undefined || end === undefined) return [];
		ranges.push({ start, end });
		searchFrom = matchAt + lowerQuery.length;
		matchAt = lowerText.indexOf(lowerQuery, searchFrom);
	}
	return ranges;
}
