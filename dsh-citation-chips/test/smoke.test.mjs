import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSection, DEFAULT_MAX_SOURCES, MAX_SOURCES_LIMIT, name, inject } from '../index.js';

test('导出契约稳定', () => {
  assert.equal(name, 'citation-chips');
  assert.deepEqual(inject, ['systemPrompt']);
  assert.equal(DEFAULT_MAX_SOURCES, 9);
});

test('默认注入「来源」最多 9 条', () => {
  const text = buildSection();
  assert.match(text, /^## Source citations/m);
  assert.match(text, /at most 9 entries/);
});

test('maxSources 生效并夹在 1..30', () => {
  assert.match(buildSection({ maxSources: 3 }), /at most 3 entries/);
  assert.match(buildSection({ maxSources: 99 }), new RegExp(`at most ${MAX_SOURCES_LIMIT} entries`));
  // 非法值回落到默认
  assert.match(buildSection({ maxSources: 0 }), /at most 9 entries/);
  assert.match(buildSection({ maxSources: 'abc' }), /at most 9 entries/);
  assert.match(buildSection({ maxSources: -5 }), /at most 9 entries/);
});

test('关键规则句都在', () => {
  const text = buildSection();
  assert.match(text, /never invent a URL/);
  assert.match(text, /reuse the same number for the same source/);
  assert.match(text, /来源/);
  assert.match(text, /If no retrieved source supports the answer/);
});

test('提示词长度可控（每次请求都会注入）', () => {
  const text = buildSection();
  assert.ok(text.length < 1200, `section 过长：${text.length} 字符`);
});
