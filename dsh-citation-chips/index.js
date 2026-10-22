/**
 * dsh-citation-chips —— Host 半边。
 *
 * 只做一件事：往系统提示词里加一个带顺序的 section，要求模型在「它支撑的那句话」
 * 末尾写一个本身就是链接的数字角标 `[1](https://…)`，并在回答结尾附 `来源` 清单。
 *
 * 边界说明：这个 bundle 只拥有提示词策略，不渲染任何界面。
 * 聊天动作条 `conversation.chat.assistant-actions` 只拿到 `{ messageId }`，
 * 没有消息正文，也没有本轮 `web_search` 的来源列表，所以纯 Client 插件在那里
 * 推不出「哪一句引哪一条」——要渲染真正的圆角 chip，需要正文渲染控制权或 Host
 * 侧后处理，那部分不在本包范围内。
 */

/** 未配置或配置非法时，`来源` 清单的默认上限。 */
export const DEFAULT_MAX_SOURCES = 9;

/** `maxSources` 的硬上限，防止一段提示词无限膨胀。 */
export const MAX_SOURCES_LIMIT = 30;

/**
 * 从配置里解出安全的来源条数上限：必须是 ≥1 的整数，越界则夹到 [1, 30]。
 * @param {{ maxSources?: unknown }} [config]
 * @returns {number}
 */
function resolveMaxSources(config) {
  const requested = Number(config && config.maxSources);
  if (!Number.isFinite(requested) || requested < 1) return DEFAULT_MAX_SOURCES;
  return Math.min(Math.floor(requested), MAX_SOURCES_LIMIT);
}

/**
 * 生成要注入的系统提示词片段。
 * 文本刻意写得短，因为它会被拼进每一次请求。
 * @param {{ maxSources?: unknown }} [config]
 * @returns {string}
 */
export function buildSection(config) {
  const max = resolveMaxSources(config);

  return [
    '## Source citations',
    '',
    'When an answer relies on retrieved material — `web_search` results, `web_fetch` pages, workspace files, or MCP resources — cite each claim at the end of the sentence that makes it, with a numeric marker that is itself a link: `[1](https://example.com/page)`.',
    '',
    '- Number citations in order of first use, starting at 1, and reuse the same number for the same source.',
    '- Every marker must point to a source actually retrieved in this session; never invent a URL.',
    '- Markers stay inside the sentence, before the closing punctuation where the language allows it.',
    '- End the answer with a `来源` list: one `n. [title](url)` line per cited source, in numeric order, at most ' + max + ' entries.',
    '- If no retrieved source supports the answer, write no citation markers at all and omit the list.',
  ].join('\n');
}

export const name = 'citation-chips';

/** 依赖 Harness 的 systemPrompt 服务。 */
export const inject = ['systemPrompt'];

/**
 * @param {import('cordis').Context} ctx
 * @param {{ maxSources?: unknown }} [config]
 */
export function apply(ctx, config) {
  const text = buildSection(config);

  // order 2250：紧跟 TOOL_WEB_SEARCH(2000) / TOOL_WEB_FETCH(2100) 之后，
  // 让「怎么引用」紧挨着「可以引用什么」出现。
  ctx.effect(() =>
    ctx.systemPrompt.section({
      name: 'citation-chips:policy',
      order: 2250,
      text,
    }),
  );
}
