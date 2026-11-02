# 首页真实媒体加载开场 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让首页开场遮幕等待首页全部已配置图片、字体和必要的首屏 Canvas 初始化完成后再释放，并让加载进度真实反映资源状态。

**Architecture:** 在首页挂载时由独立预加载器收集 `media.js` 中首页实际使用的图片 URL，逐项等待 `load` 或 `error`，再把结果交给 `Home.jsx` 的 GSAP 开场时间线。预加载只负责建立浏览器缓存，不改变现有媒体组件的懒加载、视觉布局或动画结构；失败资源视为已结算并记录结果，避免页面永久阻塞。

**Tech Stack:** React 19、Vite、GSAP、现有 Playwright CLI 验证脚本、原生 `Image`/Promise API。

**Spec:** 已在 2026-10-19 对话中确认的 bounded design：等待首页全部配置图片资源，`load` 与 `error` 均结束等待，完成后才启动现有开场动画。

## Global Constraints

- 首页需要等待主视觉、5 张精选封面、5 张 ABOUT 图片和 4 张项目初衷图片，共 15 张已配置图片。
- `image: null`、`video: null` 的空媒体位不产生等待任务。
- 图片加载失败不得让首页永久停留在遮幕上。
- 不改变首页布局、现有 GSAP 动画节奏、媒体 DOM 的懒加载属性或公网部署配置。
- 减少动态效果模式仍需尊重现有行为，但资源等待状态必须正确收敛。
- 不新增产品依赖；使用项目已有测试与运行方式。

## Review Focus

- 延迟或慢速图片响应：开场在资源完成前不得释放。
- 单张图片失败：页面应在其余资源完成后正常进入，并留下可诊断结果。
- React 组件卸载或路由切换：异步预加载完成后不得更新已卸载组件或启动旧时间线。
- 浏览器缓存与重复进入：已完成资源不应导致重复的长时间等待或重复计数。
- 减少动态效果：开场跳过时不应留下滚动锁定或可见遮幕。

### Task 1: 建立首页媒体资源清单与预加载器

**Files:**
- Create: `src/utils/preloadHomepageMedia.js`
- Test: `scripts/verify-browser.js`

**Interfaces:**
- Consumes: `media.hero`, `media.covers`, `media.portraits`、`media.purposes`。
- Produces: `collectHomepageImageSources(media) -> string[]`，去重后返回所有非空图片 URL；`preloadHomepageImages(sources, options) -> Promise<PreloadResult>`，返回 `{ total, settled, loaded, failed, failures }`。

- [ ] **Step 1: Write the failing browser assertions**

在 `scripts/verify-browser.js` 中加入测试辅助逻辑，验证首页配置图片 URL 数量为 15、页面能暴露预加载状态、失败资源也能完成结算。先运行脚本，确认新断言因状态接口尚不存在而失败。

- [ ] **Step 2: Implement `collectHomepageImageSources`**

在 `src/utils/preloadHomepageMedia.js` 中递归接收首页媒体配置，提取 `image` 字段，过滤空值并按 URL 去重；不收集员工详情媒体或不存在的 `video` 字段。

- [ ] **Step 3: Implement `preloadHomepageImages`**

使用原生 `Image` 对每个 URL 创建一次加载任务；`onload` 与 `onerror` 都将该任务标记为 settled，记录成功数、失败数和失败 URL；支持 `AbortSignal` 或取消函数，使组件卸载时不再发布状态。

- [ ] **Step 4: Run the focused verification**

运行：

```text
npx --yes --package @playwright/cli playwright-cli -s=digital-local run-code --filename scripts/verify-browser.js
```

Expected: 新增断言仍可能失败于开场接线，但资源清单与预加载器的浏览器可调用接口已经存在，其他原有首页检查继续通过。

### Task 2: 将真实加载状态接入开场时间线

**Files:**
- Modify: `src/Home.jsx`
- Modify: `src/styles.css`
- Test: `scripts/verify-browser.js`

**Interfaces:**
- Consumes: Task 1 的 `collectHomepageImageSources` 与 `preloadHomepageImages`。
- Produces: 首页根节点上的可检查状态，例如 `data-home-media-status="loading|ready|ready-with-errors"` 和 `data-home-media-progress="settled/total"`。

- [ ] **Step 1: Add a failing delayed-response test**

在 Playwright 中拦截首页图片请求并延迟响应，访问 `/` 后断言 `.opening-sequence` 仍可见、`document.documentElement` 仍有 `motion-opening`，直到所有图片响应放行后才允许开场完成。

- [ ] **Step 2: Start preloading before the GSAP opening timeline**

在 `useHomeMotion` 中先建立取消控制器和预加载 Promise；等待字体、图片预加载和必要的首屏渲染条件完成后，再创建现有 GSAP 时间线。将计数实时写到首页根节点，便于验证和后续真实进度显示。

- [ ] **Step 3: Preserve the existing animation sequence**

保留现有遮幕、主视觉裁切、标题、文案和精选员工入场的持续时间与顺序，只把时间线的启动点改为预加载完成点；无 hash 的首页继续播放开场，有 hash 或减少动态效果时继续遵循当前跳过逻辑。

- [ ] **Step 4: Handle failures and unmounts**

图片错误进入 `ready-with-errors`，开场照常释放；组件清理时取消预加载回调、清除旧 timeline 和滚动锁定，避免路由切换后旧请求改变新页面状态。

- [ ] **Step 5: Run focused browser verification**

运行：

```text
npx --yes --package @playwright/cli playwright-cli -s=digital-local run-code --filename scripts/verify-browser.js
```

Expected: 延迟测试、完成释放测试、失败收敛测试和原有首页交互检查全部通过。

### Task 3: 完善加载遮幕反馈与响应式/减少动态效果验证

**Files:**
- Modify: `src/Home.jsx`
- Modify: `src/styles.css`
- Modify: `scripts/verify-responsive.js`
- Modify: `scripts/review-visuals.js`

**Interfaces:**
- Consumes: 首页媒体状态和进度属性。
- Produces: 加载期间可见且不改变最终首页布局的真实进度反馈；减少动态效果、移动端和宽屏验证覆盖；视觉脚本可重复模拟慢速和失败图片响应。

- [ ] **Step 1: Add progress feedback to the opening overlay**

让 `.opening-index` 显示已结算数量与总数，例如 `DIGITAL MARKET / 07 OF 15`；资源完成后恢复既有 `DIGITAL MARKET / 01` 视觉或在时间线中自然淡出，避免长期停留时出现静态假进度。

- [ ] **Step 2: Add responsive and reduced-motion assertions**

验证 1920、1440、768、390、320 像素视口下遮幕无溢出；减少动态效果下不显示开场遮幕、不保留 `motion-opening`，同时首页媒体状态最终为 ready 或 ready-with-errors。

- [ ] **Step 3: Run the full focused suite**

运行：

```text
npx --yes --package @playwright/cli playwright-cli -s=digital-local run-code --filename scripts/verify-browser.js
npx --yes --package @playwright/cli playwright-cli -s=digital-local run-code --filename scripts/verify-responsive.js
npx --yes --package @playwright/cli playwright-cli -s=digital-local run-code --filename scripts/verify-edge-glow.js
npm run build
```

Expected: 三个浏览器验证脚本无运行时错误，生产构建通过，首页全部配置图片最终完成或带错误完成。

### Task 4: 代码审查、视觉检查和本地预览

**Files:**
- Review: `src/Home.jsx`, `src/utils/preloadHomepageMedia.js`, `src/components/Media.jsx`, `scripts/verify-browser.js`, `scripts/verify-responsive.js`
- Modify: `README.md` if the loading behavior or verification commands need documentation

- [ ] **Step 1: Extend and run the visual review script**

先在 `scripts/review-visuals.js` 中加入可控的网络拦截：正常模式、延迟模式和单张失败模式；再运行脚本，检查三种状态下遮幕、主视觉和首屏封面没有重叠、闪烁或提前显示。

- [ ] **Step 2: Perform code review against the requirements**

检查资源集合是否准确、错误是否可恢复、异步清理是否完整、动画节奏是否保持、测试是否真正延迟并放行网络请求；修复 Critical/Important 问题后重新运行受影响验证。

- [ ] **Step 3: Start the local website**

运行 `npm run dev -- --host 127.0.0.1`；若端口冲突，使用可用端口启动，并打开本地地址供用户查看实际效果。

- [ ] **Step 4: Final verification**

确认本地首页首次进入会等待全部 15 张首页图片结算，公网旧版本不被直接覆盖；输出本次改动、测试结果、本地预览地址和剩余限制。
