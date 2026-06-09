# Smart Code Blocks

[中文](#中文说明) | [English](#english)

---

## English

A Siyuan Note-style code block plugin for [Obsidian](https://obsidian.md).

Adds a sleek header bar to every code block with a language pill (click to pick / search / type custom), a copy button, and consistent styling across editing and reading modes.

### Features

- **Language pill** — Click the language label to open a searchable picker with 40+ preset languages. Type a custom language and it's auto-saved for next time.
- **Hover copy button** — Click to copy code content. Controls appear on hover and hide when the cursor leaves (toggleable in settings).
- **Smart Ctrl/Cmd+A** — First press selects the current code block body; second press selects all.
- **Chinese punctuation trigger** — Type `···` or `···python` then press Enter to create a code block fence.
- **Backspace deletes empty blocks** — Press Backspace in an empty code block to remove the entire block.
- **Collapsed fences** — ``` fence lines are hidden; only the header bar and code content are visible.
- **Customizable appearance** — Adjust border radius and left padding via sliders.
- **Bilingual UI** — Switch between Chinese and English in settings.
- **Mobile compatible** — Touch-optimized controls, always visible on mobile devices.

### Installation

#### From GitHub (manual)

1. Download `main.js`, `styles.css`, and `manifest.json` from the [latest release](https://github.com/perinchiang/smart-code-blocks/releases).
2. Create a folder named `siyuan-code-blocks` inside your vault's `.obsidian/plugins/` directory.
3. Copy the three files into that folder.
4. Enable the plugin in Obsidian → Settings → Community plugins.

#### From Obsidian Community Plugins (coming soon)

Search for "Smart Code Blocks" in Obsidian's community plugin browser.

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Code block radius (px) | Border radius of code blocks | 10 |
| Left padding (px) | Distance between code text and left border | 20 |
| Show controls on hover | Only show language pill & copy button on hover | On |
| Chinese punctuation trigger | `···` + Enter creates a code block | On |
| Allow custom languages | Type custom languages in the picker | On |
| Interface language | Plugin UI language (zh/en) | zh |

### Compatibility

- Obsidian v1.4.0+
- Desktop & mobile

---

## 中文说明

一款为 [Obsidian](https://obsidian.md) 带来思源笔记风格代码块的插件。

为每个代码块添加精致的头部栏，包含语言标签（点击可选择 / 搜索 / 自定义输入）和复制按钮，编辑模式与阅读模式样式一致。

### 功能特性

- **语言标签** — 点击语言标签打开可搜索的选择器，内置 40+ 预设语言。输入自定义语言会自动保存，下次可直接选用。
- **悬停复制按钮** — 点击复制代码内容。控件悬停时显示，移开后隐藏（可在设置中关闭）。
- **智能 Ctrl/Cmd+A** — 第一次按下选中当前代码块内容，第二次按下全选。
- **中文标点触发** — 输入 `···` 或 `···python` 后按回车，自动创建代码块围栏。
- **Backspace 删除空代码块** — 在空代码块中按 Backspace 可删除整个代码块。
- **围栏折叠** — 自动隐藏 ``` 围栏行，只显示头部栏和代码内容。
- **外观自定义** — 通过滑块调整圆角大小和左侧内边距。
- **双语界面** — 在设置中切换中文/英文。
- **移动端兼容** — 触控优化，控件在移动端始终可见。

### 安装

#### 从 GitHub 手动安装

1. 从 [最新发布](https://github.com/perinchiang/smart-code-blocks/releases) 下载 `main.js`、`styles.css` 和 `manifest.json`。
2. 在你的仓库 `.obsidian/plugins/` 目录下创建 `siyuan-code-blocks` 文件夹。
3. 将三个文件复制到该文件夹中。
4. 在 Obsidian → 设置 → 第三方插件 中启用本插件。

#### 从 Obsidian 社区插件市场安装（即将上架）

在 Obsidian 社区插件浏览器中搜索 "Smart Code Blocks"。

### 设置项

| 设置 | 说明 | 默认值 |
|------|------|--------|
| 代码块圆角 (px) | 代码块的圆角大小 | 10 |
| 左侧内边距 (px) | 代码文字与左边框的距离 | 20 |
| 悬停显示控件 | 仅在悬停时显示语言标签和复制按钮 | 开启 |
| 中文标点触发 | `···` + 回车创建代码块 | 开启 |
| 允许自定义语言 | 在选择器中输入自定义语言 | 开启 |
| 界面语言 | 插件界面语言（中文/英文） | 中文 |

### 兼容性

- Obsidian v1.4.0+
- 桌面端 & 移动端

---

## License

MIT
