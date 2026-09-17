---
name: land
description: >-
  仅在用户明确要求为 langliu/langliu.github.io 合入变更、点击 Land Changes、
  调用 /land 或同意执行本技能时使用。通过 GitHub PR、验证和 squash 合并完成
  main 分支落地并报告部署状态。不要因代码审查、准备提交、检查通过或安装技能而触发。
metadata:
  delta-action: land
---

# 合入博客变更

使用中文沟通。适用于 `langliu/langliu.github.io`，不适用于其他仓库。
显式调用 `/land`、Land Changes 或同意运行本技能已经提供合入意图：
直接执行以下流程，不重复索要合并许可。安装技能本身不是执行许可。

## 1. 确定范围与目标

- 阅读当前 `AGENTS.md`、修改目录的嵌套指令及适用的贡献政策和 PR 模板。
  项目“不主动执行 git commit”的约定仍有效；仅在本次明确合入请求中创建必要提交。
- 检查工作区、暂存区、当前分支及相对目标的提交，明确本次请求涵盖的文件。
  包括尚未提交的相关修改，但不混入无关文件或已有暂存内容。
  无法区分范围时停下来问一个具体问题；不要清空、覆盖或自动 stash 他人的工作。
- 重新检查 Git remotes。预期发布目标为 `origin` 指向的
  `https://github.com/langliu/langliu.github.io.git`，目标分支为 `main`。
  `local` 是用户主检出的回链，不得用于发布。远端或目标发生实质变化时先澄清。
- 检查 `gh` 身份、仓库权限、默认分支、允许的合并方式、`main` 分支保护、
  rulesets 和适用审核要求。查询失败不能解释为“没有限制”。
  配置时仓库允许 squash 且没有分支保护；这不是永久事实，也不构成绕过政策的许可。
- 核对任何新增贡献要求：签名、CLA、首次贡献步骤、人工撰写提交材料、
  必需审核、测试、文档和变更日志。只处理适用且尚未满足的要求。
  若要求人工撰写，向用户索取原文，不能用批准代理生成的文本代替。
- 没有待合入变更时说明现状，不制造空提交，不报告新的合入成功。

## 2. 准备并验证

- 使用项目工作区，不操作用户主检出。获取发布远端的最新状态，
  从正确基线创建唯一主题分支，或复用仅包含本次工作且目标正确的现有 PR 分支。
  检查已有提交和修改，避免在切换分支时丢失内容。
- 用户选择自动解决意图明确的冲突。优先把最新 `origin/main` 合并进主题分支，
  避免重写已发布历史；安全解决后检查完整差异。
  冲突有歧义、涉及不明修改或存在覆盖风险时暂停，保留工作并询问。
  不执行强推、破坏性 reset、跳过 hooks 或绕过分支保护。
- 核对 `package.json` 的 `packageManager` 和 `devEngines.runtime`。
  配置时为 pnpm 12.3.4、Node 24.18.0；默认 shell Node 曾为其他版本，
  不要仅凭 `node` 存在就认为运行时正确。使用 pnpm 管理的项目运行时，
  安装后确认实际执行环境满足 manifest；无法获取兼容运行时则报告阻塞。
- 安装依赖使用 `pnpm install --frozen-lockfile`。
  来源：`AGENTS.md`、`.github/workflows/ci-check.yaml` 和
  `.github/workflows/deploy.yml` 的安装步骤；运行时来源：`package.json`。
  不为让安装通过而修改锁文件，除非该修改本就是请求范围。
- 按修改范围做本地验证，以下精确命令均定义于 `package.json` 的 scripts，
  并由 `.github/workflows/ci-check.yaml` 执行：

  ```sh
  pnpm run check
  pnpm run lint
  pnpm run format:check
  pnpm run content:lint
  pnpm run build
  ```

  应用、依赖、配置或文章变更运行完整组；纯技能或说明文档变更可先做
  差异、格式及 frontmatter 检查，但远端完整 CI 不豁免。
  没有独立 test 脚本，不杜撰 `pnpm test`。界面行为修改另做相关实际使用验证。
  安装或验证失败时分析具体原因，不更换锁文件策略、不把跳过的检查说成通过。
- 文章修改须满足 `AGENTS.md` 的必填字段、发布文章 tags 和第三方链接要求；
  技术 schema 见 `src/content.config.ts`，内容检查实现见 `scripts/content-lint.mjs`。
  schema 允许的默认值不取消明确的内容政策。
- 仅暂存本次相关文件或明确的相关片段，检查暂存差异及敏感信息。
  提交格式按 `AGENTS.md`：`<type>: <subject>`，祈使句，主题不超过 50 字符、
  不加句号，正文每行不超过 72 字符。
  Git 提交和合并使用 `GIT_EDITOR=true` 并提供非交互消息。
  保留签名要求，不伪造作者或关闭签名来规避失败。
- 不绕过 hooks。`lefthook.yml` 定义提交前 Biome 自动修正，以及推送前
  check、lint、content:lint；若 hook 修改文件，检查其范围并重新验证。
  不假定 hooks 已安装，必要验证由上述命令和 CI 保证。

## 3. 发布、检查与合并

- 仅将主题分支推送到核实过的发布远端。通过 `gh` 复用或创建目标为 `main`
  的 PR，提供非交互标题和正文，遵守提交模板、说明修改内容及实际验证结果。
  推送主题分支或创建 PR 都不是落地完成。
- 确认 PR 最新 head SHA、base 分支及 base 的最新状态，检查完整远端 CI。
  `.github/workflows/ci-check.yaml` 在 PR 和非 main 推送运行 `check-astro`，
  包含上列全部五项验证。即便没有配置 required checks，也必须确认这个完整
  CI 对待合入版本成功，不能仅依赖 `gh pr checks --required` 的空结果。
- 可用 `gh pr checks <PR> --watch` 观察，再通过 PR/check/run 数据确认对应 SHA、
  结论和真实 URL。对长时间监听设置终端超时，超时后查询状态而非假定成功。
  检查缺失、待运行、失败、取消、跳过或不可验证都不算成功。
  满足所有当前适用的额外 required checks、审核和未解决讨论要求。
- 若代码、冲突解决、hook 输出或 PR head 更新，先重新验证最新版本。
  基线推进时按当前规则更新主题分支并重新检查；不能使用旧版本通过的结果。
  CI 失败可在本次范围内安全修复并再次推送，范围外问题先报告阻塞。
- 默认 squash 合并，使用非交互命令，并锁定已验证的 head：

  ```sh
  gh pr merge <PR> --repo langliu/langliu.github.io --squash --match-head-commit <verified-head-sha> --subject "<type>: <subject>" --body "<summary>"
  ```

  尖括号内容必须替换为本次核实的值，不得原样执行。
  若仓库不再允许 squash，暂停说明并请求选择，不擅自更换历史策略。
  不用 `--admin` 绕过要求，也不在检查未通过时用自动合并代替验证。
  若目标要求 merge queue，遵从队列规则，不绕过队列；排队不算完成，
  必须等到队列检查和实际合入得到验证。
- 保留分支，不默认删除本地或远端分支，不改动用户主检出或 unrelated 工作。

## 4. 验证目的地与报告

- 查询 PR 的实际 merged 状态与 merge commit，获取目标分支最新状态，
  验证该提交已进入发布远端的 `main` 历史，并核实请求范围确实包含在合入内容中。
  squash 后提交 SHA 与主题分支不同，不以原 head 在 main 上的祖先关系判断。
- 跟踪实际合入 SHA 对应的 `.github/workflows/deploy.yml`：
  main 推送先进行质量检查，再构建并部署 GitHub Pages。
  核实对应 run 的结论和 URL；不要把其他提交的绿灯用于本次结果。
- 区分“已合入 main”与“Pages 已部署”。部署待运行或失败时准确说明：
  代码已合入，但部署未完成或失败。不要声称网站已更新，也不要把部署失败
  错报为代码尚未合入。可安全恢复时继续处理并更新结果。
- 在子线程且有 `report_subthread_status` 时向父线程报告，否则在当前对话报告。
  `success` 仅用于已验证请求变更到达目标分支；
  尝试失败或真实阻塞用 `failure`，注明是否已合入。
  不把通过构建、准备提交、推送分支、创建 PR 或安装技能当作 landing success。
  不用该工具报告安装完成或日常进度。
- 标题用几个简短词，描述限一短行；包含实际提交的短 SHA 链接和真实 CI/run
  结果链接。链接必须经过核实，不存在或不能验证的链接直接省略。
  例如：标题“已合入 main”，描述“[短 SHA](真实提交 URL) · [CI 通过](真实运行 URL)。”
  检查失败时标题“CI 阻塞”，描述相应运行链接与“尚未合入”。
  含糊或不安全的冲突应说明阻塞，问题留在对话里，不放进状态事件。
  失败不是终止标记：恢复后重新验证并报告更新结果。
