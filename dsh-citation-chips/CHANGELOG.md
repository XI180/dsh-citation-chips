# Changelog

## 1.0.0 — 2026-10-21

首个独立发布版本，从会话内的本地 bundle（`@local/citation-chips`）整理而来。

- 包名统一为 `dsh-citation-chips`（`package.json` 与 `cordis.patch.yml` 保持一致）；
- 新增 `node:test` 自测：导出契约、`maxSources` 边界、规则句、注入长度；
- 新增 GitHub Actions CI；
- 新增 MIT LICENSE、`.gitignore`、完整 README（含效果示例与 Host-only 的设计说明）；
- `maxSources` 的解析抽成 `resolveMaxSources()`，非法值统一回落到默认值 9，硬上限 30；
- 移除未使用的 `MIN_ORDER_GAP` 导出。
