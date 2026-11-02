import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findCaseInsensitiveRanges } from '../src/utils/inpage-search.ts';

const highlightedText = (text, query) =>
	findCaseInsensitiveRanges(text, query).map(({ start, end }) => text.slice(start, end));

test('maps lowercase expansions back to the original code point', () => {
	assert.equal('İstanbul'.toLowerCase(), 'i\u0307stanbul');
	assert.deepEqual(findCaseInsensitiveRanges('İstanbul', 's'), [{ start: 1, end: 2 }]);
	assert.deepEqual(highlightedText('İstanbul', 's'), ['s']);
	assert.deepEqual(highlightedText('İ', 'i\u0307'), ['İ']);
});

test('matches ASCII case-insensitively without changing source ranges', () => {
	assert.deepEqual(
		findCaseInsensitiveRanges('Hello HELLO', 'hello'),
		[{ start: 0, end: 5 }, { start: 6, end: 11 }]
	);
	assert.deepEqual(highlightedText('Hello HELLO', 'hello'), ['Hello', 'HELLO']);
});

test('matches Chinese text literally', () => {
	assert.deepEqual(highlightedText('中文文档 中文', '文档'), ['文档']);
});

test('counts astral characters in UTF-16 offsets without splitting a match', () => {
	assert.deepEqual(findCaseInsensitiveRanges('🙂Hello', 'hello'), [{ start: 2, end: 7 }]);
	assert.deepEqual(highlightedText('🙂Hello', '🙂'), ['🙂']);
});

test('preserves searchable combining marks and their source ranges', () => {
	const text = 'Cafe\u0301 and cafe\u0301';
	assert.deepEqual(highlightedText(text, '\u0301'), ['\u0301', '\u0301']);
});

test('treats regular-expression metacharacters as literal query text', () => {
	assert.deepEqual(highlightedText('a+b [x] and a+b [x]', 'a+b [x]'), ['a+b [x]', 'a+b [x]']);
});

test('uses default lowercase conversion, not full case folding', () => {
	assert.deepEqual(highlightedText('straße', 'ss'), []);
	assert.deepEqual(highlightedText('STRASSE', 'straße'), []);
});

test('handles empty queries, no-match queries, and non-overlapping matches', () => {
	assert.deepEqual(findCaseInsensitiveRanges('anything', ''), []);
	assert.deepEqual(findCaseInsensitiveRanges('anything', 'missing'), []);
	assert.deepEqual(highlightedText('aaa', 'aa'), ['aa']);
});

test('adjacent matches around lowercase expansions preserve the original text', () => {
	const text = 'İssİ';
	const ranges = findCaseInsensitiveRanges(text, 's');
	assert.deepEqual(ranges, [
		{ start: 1, end: 2 },
		{ start: 2, end: 3 },
	]);
	assert.equal(ranges.map(({ start, end }) => text.slice(start, end)).join(''), 'ss');
	assert.equal(text.slice(0, ranges[0].start) + ranges.map(({ start, end }) => text.slice(start, end)).join('') + text.slice(ranges.at(-1).end), text);
});

test('retains whole-string contextual lowercase matching', () => {
	assert.deepEqual(highlightedText('ΟΣ', 'ς'), ['Σ']);
});
