# ABOUT 数字员工界面图 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为现有 ABOUT 手风琴画廊制作并接入五张 AI 软件界面演示图，让访客看懂数字员工的工作过程与交付结果。

**Architecture:** 使用内置 image_gen 生成素材，通过现有 media.portraits 接口接入；沿用 React 手风琴及 Media 组件，不搭建真实工作台。先制作企业知识库样图供用户确认，再延续其界面语言完成其余四张。图片的实际裁切由现有组件验证，必要时局部调整。

**Tech Stack:** React、Vite、现有 CSS、image_gen、WebP、Playwright。

**Spec:** 本文“已确认设计”整理本轮 brainstorming 结果。

## 已确认设计

- 五张均为 AI 生成的软件界面效果图，展示数字员工改造后的体验，不使用原开源项目截图。
- 统一 DMKT 工作台：深灰外框、浅色内容区、少量品牌绿强调；清晰、真实软件质感，无概念办公空间、人物或设备摄影。
- 顺序：企业知识库员工、保密会议纪要员、AI 热点观察员、法律研究助理、代码执行员工。
- 内容分别为：带资料引用的差旅制度问答；会议摘要与行动项；带来源的 AI 动态简报；合同原文与研究批注；销售数据分析图表与结果附件。
- 演示使用虚构数据，关键标题、数值和内容保持一致、可读；法律内容以辅助研究和待复核事项呈现。
- 每张围绕一个任务，以交付结果为主体，保留简短指令和处理痕迹；统一轻量标注“数字员工界面概念演示”。
- 保留手风琴布局、员工顺序及键盘/点击/悬停交互；主体在中央，兼顾收起窄条和展开构图。
- 雨景视频不接入，其他首页图片不在本轮替换范围。

## Global Constraints

- 项目当前不是 Git 仓库，不创建提交、不初始化仓库。
- 原始图片与提示词保存在 assets/drafts/about-ui/；网页文件保存在 public/media/digital-market/。
- 图片生成与修图使用内置 image_gen；转换格式可用现有 Python/Pillow 流程。
- 不修改公网部署；完成后启动本地网站查看。

## Review Focus

- 手风琴中央裁切是否丢失核心成果：桌面逐张展开截图复查。
- 320/390 像素视口是否溢出或无法操作：移动视口检查与逐张点击。
- 图片是否错误对应员工：按画廊顺序核对五张图与标题。
- 图片失败或减少动态效果时是否影响浏览：复核现有 Media 降级与画廊操作。
- 生成文字、图表数据是否明显矛盾：原图人工检查；不以技术测试通过代替视觉验收。

## Task 1：企业知识库样图

**Files:** 新建 assets/drafts/about-ui/knowledge-base-v1-prompt.txt 与生成原图。

**Interfaces:** 输出统一视觉参考样图及其提示词，供剩余四张参考。

- [ ] 编写首张提示词：2:3 竖幅、正视软件界面、深灰外框与浅色内容区；聚焦差旅制度问答与引用卡片，关键文字精简。
- [ ] 使用 image_gen 生成，保存原图与提示词到项目。
- [ ] 检查文字、信息层级、中心裁切与真实性；必要时针对问题修图。
- [ ] 向用户展示样图，确认后再制作其余四张；未确认时保留为草稿，不批量接入。

## Task 2：完成五张素材

**Files:** assets/drafts/about-ui/ 各图及提示词；public/media/digital-market/about-01-knowledge.webp 至 about-05-code.webp；必要的素材转换脚本。

**Interfaces:** 五个同风格 WebP 文件，按 media.portraits 顺序消费。

- [ ] 以已确认样图为风格参考，逐张生成会议、热点、法律、代码图。
- [ ] 检查五张任务与产出准确对应，修复明显错字、数值矛盾及排版缺陷。
- [ ] 转换为 WebP，检查图片尺寸、文件大小和解码结果。

## Task 3：接入与自动化验证

**Files:** 修改 src/data/media.js、src/Home.jsx，必要时修改 src/styles.css；新建 scripts/verify-about-media.js。

**Interfaces:** media.portraits 仍为五个 { image, video: null } 条目；沿用当前 Media 组件。

- [ ] 添加浏览器检查：五张图片成功加载、有自然尺寸；点击与键盘切换对应正确标题；320/390/1440 像素不产生页面横向溢出；保留 hero.video 为 null。
- [ ] 在接入前运行新增检查，确认缺少图片的断言失败。
- [ ] 配置五张图片，添加统一的概念演示说明，仅在实际裁切需要时调整样式。
- [ ] 运行 npm run build、新增专项检查及相关已有画廊/响应式检查；只修复本轮引入的问题。
- [ ] 输出桌面逐张展开及手机截图，人工核对清晰度、裁切与说明可读性。

## Task 4：代码审查与本地交付

**Files:** 更新 README.md，记录实际结果与素材入口。

- [ ] 审查变更：素材映射、可访问性、移动布局、加载成本、范围控制；使用可用代码审查工具，若不可用则明确自审。
- [ ] 修复审查发现的问题，重跑受影响检查。
- [ ] 启动或复用本地 Vite 服务，确认 HTTP 响应，打开本地网站的 ABOUT 区域。
- [ ] 交付实际访问地址、截图、素材/提示词路径与验证结果；明确公网尚未更新。
