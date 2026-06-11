"use strict";

const { Plugin, SuggestModal, Notice, setIcon, PluginSettingTab, Setting } = require("obsidian");
const { EditorView, Decoration, WidgetType, keymap } = require("@codemirror/view");
const { StateField, RangeSetBuilder, Prec, EditorState } = require("@codemirror/state");

/* ============================================================
   Default settings
   ============================================================ */
const DEFAULT_SETTINGS = {
  customBgColor: false,
  customRadius: false,
  customPadding: false,
  showHeaderSeparator: false,
  codeBlockPreset: "none",
  codeBlockRadius: 10,
  codeBlockPaddingLeft: 20,
  codeBlockPaddingRight: 20,
  copyButtonOnHover: true,
  chineseFenceTrigger: true,
  allowCustomLanguage: true,
  customLanguages: [],
  jumpUpHotkey: "Mod-Shift-b",
  jumpDownHotkey: "Mod-Shift-a",
  language: "zh",
};

/* ============================================================
   i18n — Chinese / English
   ============================================================ */
const i18n = {
  zh: {
    settings: {
      title: "Code Block Plus",
      subtitle: "为 Obsidian 代码块添加语言选择器、复制按钮和增强功能",
      appearance: "外观设置",
      customBgColor: "自定义背景色",
      customBgColorDesc: "开启后使用自定义背景色和边框（关闭则使用 Obsidian 原生样式）",
      customRadius: "自定义圆角",
      customRadiusDesc: "开启后可调整代码块圆角大小",
      customPadding: "自定义间距",
      customPaddingDesc: "开启后可调整代码内容左侧内边距",
      showHeaderSeparator: "显示标题分隔线",
      showHeaderSeparatorDesc: "在语言栏与代码内容之间显示分隔线",
      codeBlockPreset: "代码块风格预设",
      codeBlockPresetDesc: "选择预设风格（会覆盖部分自定义外观设置）",
      presetNone: "默认",
      presetMac: "Mac 红绿灯（夜间）",
      presetZhihu: "知乎（日间）",
      presetGithub: "GitHub（夜间）",
      presetVscode: "VS Code 暗色（夜间）",
      presetNotion: "Notion（日间）",
      presetDracula: "Dracula（夜间）",
      presetCustom: "自定义边框（日间）",
      radius: "代码块圆角 (px)",
      radiusDesc: "控制代码块的圆角大小，默认 10px",
      paddingLeft: "代码内容左侧内边距 (px)",
      paddingLeftDesc: "代码文字与左边框的距离，默认 20px",
      paddingRight: "代码内容右侧内边距 (px)",
      paddingRightDesc: "代码文字与右边框的距离，默认 20px",
      behavior: "行为设置",
      copyOnHover: "悬停显示控件",
      copyOnHoverDesc: "仅在鼠标悬停代码块时显示语言标签和复制按钮，移开后自动隐藏",
      chineseTrigger: "中文标点触发代码块",
      chineseTriggerDesc: "输入 ··· 或 ···python 后按回车，自动替换为代码块围栏",
      customLanguage: "允许自定义语言",
      customLanguageDesc: "允许在语言选择器中输入自定义语言（关闭后只能从预设列表中选择）",
      customLanguageManage: "自定义语言管理",
      customLanguageAdd: "添加自定义语言",
      customLanguageAddDesc: "输入语言名称后点击添加",
      customLanguageEmpty: "暂无自定义语言",
      customLanguageDelete: "删除",
      jumpUpHotkey: "跳出代码块（上方）快捷键",
      jumpUpHotkeyDesc: "在代码块内按下此快捷键，光标跳到代码块上方一行",
      jumpDownHotkey: "跳出代码块（下方）快捷键",
      jumpDownHotkeyDesc: "在代码块内按下此快捷键，光标跳到代码块下方一行",
      hotkeyHint: "格式示例：Mod-Shift-b（Mod 代表 Ctrl/Cmd）",
      language: "界面语言",
      languageDesc: "切换插件界面语言（设置面板、提示等）",
    },
    notices: {
      copied: "已复制代码",
      copyFailed: "复制失败",
    },
    langPicker: {
      placeholder: "选择或输入语言…  (回车确认)",
      custom: "自定义",
      plainText: "纯文本",
    },
    usage: {
      title: "使用说明",
      items: [
        "点击语言标签可弹出语言选择器，支持搜索和自定义输入",
        "点击复制按钮可一键复制代码内容",
        "在代码块内按 Ctrl/Cmd+A 先选中当前代码块，再按则全选",
        "输入 ··· 或 ···python 后按回车可快速创建代码块",
        "悬停代码块时显示控件，移开后自动隐藏",
        "空代码块中按 Backspace 可删除整个代码块",
        "按 Ctrl/Cmd+Shift+B 跳到代码块上方，Ctrl/Cmd+Shift+A 跳到代码块下方（可在设置中自定义）",
      ],
    },
  },
  en: {
    settings: {
      title: "Code Block Plus",
      subtitle: "Adds a language picker, copy button, and enhanced features to Obsidian code blocks",
      appearance: "Appearance",
      customBgColor: "Custom background",
      customBgColorDesc: "Enable to use custom background color and border (disable to use Obsidian's native style)",
      customRadius: "Custom radius",
      customRadiusDesc: "Enable to adjust code block border radius",
      customPadding: "Custom padding",
      customPaddingDesc: "Enable to adjust left padding of code content",
      showHeaderSeparator: "Show header separator",
      showHeaderSeparatorDesc: "Show a separator line between the language bar and code content",
      codeBlockPreset: "Code block style preset",
      codeBlockPresetDesc: "Choose a preset style (overrides some custom appearance settings)",
      presetNone: "Default",
      presetMac: "Mac Traffic Lights (Dark)",
      presetZhihu: "Zhihu (Light)",
      presetGithub: "GitHub (Dark)",
      presetVscode: "VS Code Dark (Dark)",
      presetNotion: "Notion (Light)",
      presetDracula: "Dracula (Dark)",
      presetCustom: "Custom Borders (Light)",
      radius: "Code block radius (px)",
      radiusDesc: "Controls the border radius of code blocks, default 10px",
      paddingLeft: "Left padding of code content (px)",
      paddingLeftDesc: "Distance between code text and left border, default 20px",
      paddingRight: "Right padding of code content (px)",
      paddingRightDesc: "Distance between code text and right border, default 20px",
      behavior: "Behavior",
      copyOnHover: "Show controls on hover",
      copyOnHoverDesc: "Only show the language pill and copy button when hovering over the code block",
      chineseTrigger: "Chinese punctuation trigger",
      chineseTriggerDesc: "Type ··· or ···python and press Enter to create a code block fence",
      customLanguage: "Allow custom languages",
      customLanguageDesc: "Allow typing custom languages in the picker (turn off to restrict to preset list only)",
      customLanguageManage: "Custom language management",
      customLanguageAdd: "Add custom language",
      customLanguageAddDesc: "Enter a language name and click add",
      customLanguageEmpty: "No custom languages yet",
      customLanguageDelete: "Delete",
      jumpUpHotkey: "Jump out (above) hotkey",
      jumpUpHotkeyDesc: "Press this hotkey inside a code block to jump above it",
      jumpDownHotkey: "Jump out (below) hotkey",
      jumpDownHotkeyDesc: "Press this hotkey inside a code block to jump below it",
      hotkeyHint: "Format example: Mod-Shift-b (Mod = Ctrl/Cmd)",
      language: "Interface language",
      languageDesc: "Switch the plugin interface language",
    },
    notices: {
      copied: "Code copied",
      copyFailed: "Copy failed",
    },
    langPicker: {
      placeholder: "Select or type a language… (Enter to confirm)",
      custom: "Custom",
      plainText: "Plain text",
    },
    usage: {
      title: "Usage Guide",
      items: [
        "Click the language pill to open the language picker (search + custom input)",
        "Click the copy button to copy code content",
        "Press Ctrl/Cmd+A inside a code block to select it first, then all",
        "Type ··· or ···python and press Enter to quickly create a code block",
        "Controls appear on hover and hide when cursor leaves",
        "Press Backspace in an empty code block to delete the entire block",
        "Press Ctrl/Cmd+Shift+B to jump above the code block, Ctrl/Cmd+Shift+A to jump below (customizable in settings)",
      ],
    },
  },
};

/* Common languages offered in the picker. The user can also type a custom one. */
const COMMON_LANGUAGES = [
  "text", "bash", "shell", "powershell", "python", "javascript", "typescript",
  "jsx", "tsx", "json", "yaml", "toml", "html", "css", "scss", "markdown",
  "c", "cpp", "csharp", "java", "kotlin", "go", "rust", "swift", "php", "ruby",
  "sql", "dockerfile", "ini", "xml", "diff", "lua", "r", "matlab", "dart",
  "scala", "perl", "haskell", "vim", "makefile", "nginx", "graphql", "mermaid",
];

/* ============================================================
   Mobile detection — hover-only controls are disabled on touch
   devices (no cursor), keyboard shortcuts are simplified.
   ============================================================ */
function isMobilePlatform() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) return true;
  const platform = (navigator.platform || "").toLowerCase();
  if (/iphone|ipad|ipod|android/.test(platform)) return true;
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return true;
  return false;
}

/* ============================================================
   Fence parsing — find every fenced code block in the document.
   Returns blocks with 1-based line numbers so callers can re-resolve
   live positions from the current doc (robust against edits elsewhere).
   ============================================================ */
function parseFences(doc) {
  const blocks = [];
  let open = null;
  const fenceRe = /^(\s*)(`{3,}|~{3,})(.*)$/;
  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const m = line.text.match(fenceRe);
    if (!m) continue;
    const ticks = m[2];
    const rest = m[3];
    if (!open) {
      const lang = rest.trim().split(/\s+/)[0] || "";
      open = { beginLineNo: i, char: ticks[0], len: ticks.length, lang };
    } else if (ticks[0] === open.char && ticks.length >= open.len && rest.trim() === "") {
      blocks.push({ beginLineNo: open.beginLineNo, endLineNo: i, lang: open.lang });
      open = null;
    }
  }
  return blocks;
}

/* Resolve the language token range on a begin line of the current doc. */
function langTokenRange(doc, beginLineNo) {
  const line = doc.line(beginLineNo);
  const m = line.text.match(/^(\s*)(`{3,}|~{3,})/);
  if (!m) return null;
  const afterTicks = m[1].length + m[2].length;
  const tail = line.text.slice(afterTicks);
  const lead = tail.length - tail.trimStart().length;
  const tokenStart = line.from + afterTicks + lead;
  const token = tail.trimStart().match(/^\S+/);
  const tokenEnd = token ? tokenStart + token[0].length : tokenStart;
  return { from: tokenStart, to: tokenEnd };
}

/* Code text between the fences (empty string if the block has no body). */
function blockBodyText(doc, b) {
  if (b.beginLineNo + 1 > b.endLineNo - 1) return "";
  const from = doc.line(b.beginLineNo + 1).from;
  const to = doc.line(b.endLineNo - 1).to;
  return doc.sliceString(from, to);
}

/* ============================================================
   Clipboard helper with fallback
   ============================================================ */
async function copyText(text, lang) {
  const t = i18n[lang] || i18n.zh;
  try {
    await navigator.clipboard.writeText(text);
    new Notice(t.notices.copied);
  } catch (_e) {
    // Fallback for restricted contexts
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      new Notice(t.notices.copied);
    } catch (_e2) {
      new Notice(t.notices.copyFailed);
    }
  }
}

/* ============================================================
   Language picker — searchable list + custom input.
   ============================================================ */
class LangSuggest extends SuggestModal {
  constructor(app, current, onChoose, lang, plugin) {
    super(app);
    this.onChoose = onChoose;
    this.lang = lang || "zh";
    this.plugin = plugin;
    const t = i18n[this.lang] || i18n.zh;
    this.setPlaceholder(t.langPicker.placeholder);
  }
  getSuggestions(query) {
    const q = query.toLowerCase().trim();
    // Combine preset + custom languages
    const allLangs = [...COMMON_LANGUAGES, ...(this.plugin.settings.customLanguages || [])];
    const matches = allLangs.filter((l) => l.toLowerCase().includes(q));

    if (this.plugin.settings.allowCustomLanguage && q && !allLangs.some((l) => l.toLowerCase() === q)) {
      return [q, ...matches];
    }
    return matches.length ? matches : allLangs;
  }
  renderSuggestion(item, el) {
    const t = i18n[this.lang] || i18n.zh;
    el.setText(item);
    const isCustom = this.plugin.settings.customLanguages.includes(item);
    const isPreset = COMMON_LANGUAGES.includes(item);
    if (!isPreset && isCustom) {
      el.createSpan({ text: `  (${t.langPicker.custom})`, cls: "siyuan-code-custom-hint" });
    } else if (!isPreset) {
      el.createSpan({ text: `  (${t.langPicker.custom})`, cls: "siyuan-code-custom-hint" });
    }
  }
  onChooseSuggestion(item) {
    // Save custom language if it's new and custom languages are allowed
    if (
      this.plugin.settings.allowCustomLanguage &&
      !COMMON_LANGUAGES.includes(item) &&
      !this.plugin.settings.customLanguages.includes(item)
    ) {
      this.plugin.settings.customLanguages.push(item);
      this.plugin.saveSettings();
    }
    this.onChoose(item.trim());
  }
}

/* ============================================================
   Editing-mode header widget (block widget placed above each code block).
   ============================================================ */
class CodeHeaderWidget extends WidgetType {
  constructor(plugin, block) {
    super();
    this.plugin = plugin;
    this.b = block;
  }
  eq(other) {
    return (
      other.b.lang === this.b.lang &&
      other.b.beginLineNo === this.b.beginLineNo &&
      other.b.endLineNo === this.b.endLineNo
    );
  }
  toDOM(view) {
    const lang = this.plugin.settings.language || "zh";
    const t = i18n[lang] || i18n.zh;

    const header = document.createElement("div");
    header.className = "siyuan-code-header";
    header.style.cssText =
      "display:flex;flex-flow:row nowrap;align-items:center;width:100%;box-sizing:border-box;";

    const pill = header.createDiv({ cls: "siyuan-code-lang" });
    pill.style.cssText = "flex:0 1 auto;width:auto;";
    pill.setText(this.b.lang || t.langPicker.plainText);
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      new LangSuggest(this.plugin.app, this.b.lang, (newLang) => {
        const doc = view.state.doc;
        if (this.b.beginLineNo > doc.lines) return;
        const range = langTokenRange(doc, this.b.beginLineNo);
        if (!range) return;
        view.dispatch({ changes: { from: range.from, to: range.to, insert: newLang } });
      }, lang, this.plugin).open();
    });

    const copy = header.createDiv({ cls: "siyuan-code-copy" });
    copy.style.cssText = "flex:0 0 auto;width:auto;margin-left:auto;display:inline-flex;align-items:center;";
    setIcon(copy, "copy");
    copy.setAttribute("aria-label", t.notices.copied);
    copy.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      copyText(blockBodyText(view.state.doc, this.b), lang);
    });

    return header;
  }
  ignoreEvent() {
    return true;
  }
}

/* ============================================================
   Chinese fence trigger — ··· + Enter → code block
   Uses EditorState.transactionFilter to intercept the Enter key
   after typing three middle dots (U+00B7).
   ============================================================ */
function createFenceTrigger(plugin) {
  // Matches: ··· (three middle dots U+00B7) at line start,
  // optionally followed by a single word (language name) with no trailing spaces/punctuation.
  const fenceRe = /^\u00B7\u00B7\u00B7(?:([a-zA-Z0-9_+-]+))?$/;

  return EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged || !plugin.settings.chineseFenceTrigger) return tr;

    let replacement = null;

    tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
      if (replacement) return; // only handle first match
      const text = inserted.toString();
      if (!text.includes("\n")) return;

      const line = tr.startState.doc.lineAt(fromA);
      const lineText = line.text.trimEnd();

      const m = lineText.match(fenceRe);
      if (!m) return;

      const lang = m[1] || "";
      const fence = lang ? "```" + lang : "```";
      replacement = {
        from: line.from,
        to: toA,
        insert: fence + "\n\n```",
      };
    });

    if (!replacement) return tr;

    // Return a replacement transaction spec (not an array — we replace the
    // original transaction entirely so the ··· line + its newline are swapped
    // for ```\n\n``` in one atomic change).
    return {
      changes: { from: replacement.from, to: replacement.to, insert: replacement.insert },
      selection: { anchor: replacement.from + replacement.insert.indexOf("\n") + 1 },
    };
  });
}

/* ============================================================
   Ensure empty code blocks have a blank body line so the user
   can place the cursor there and press Backspace to delete the
   whole block (since fence lines are hidden by CSS).
   When a new code block appears with begin +1 === end (no body),
   we insert a newline between them.
   ============================================================ */
function createEnsureEmptyLine() {
  return EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged) return tr;

    const newDoc = tr.state.doc;
    const blocks = parseFences(newDoc);
    let insertion = null;

    for (const b of blocks) {
      // Only care about blocks with no body: begin+1 === end
      if (b.endLineNo - b.beginLineNo !== 1) continue;

      // Check if this block already existed in the old doc (skip if so)
      const oldDoc = tr.startState.doc;
      const oldBlocks = parseFences(oldDoc);
      const existed = oldBlocks.some(
        (ob) => ob.beginLineNo === b.beginLineNo && ob.endLineNo === b.endLineNo
      );
      if (existed) continue;

      // Insert a blank line between begin and end
      const endLine = newDoc.line(b.endLineNo);
      insertion = {
        from: endLine.from,
        to: endLine.from,
        insert: "\n",
      };
      // Adjust selection to the new empty line
      break;
    }

    if (!insertion) return tr;

    const sel = tr.selection
      ? { anchor: insertion.from + 1 }
      : undefined;

    return {
      changes: insertion,
      selection: sel,
    };
  });
}

/* ============================================================
   Settings Tab
   ============================================================ */
class SiyuanSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const lang = this.plugin.settings.language || "zh";
    const t = i18n[lang] || i18n.zh;

    containerEl.empty();

    // Title
    containerEl.createEl("h2", { text: t.settings.title });
    containerEl.createEl("p", {
      text: t.settings.subtitle,
      cls: "setting-item-description",
    });

    // --- Appearance ---
    containerEl.createEl("h3", { text: t.settings.appearance });

    new Setting(containerEl)
      .setName(t.settings.codeBlockPreset)
      .setDesc(t.settings.codeBlockPresetDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            none: t.settings.presetNone,
            mac: t.settings.presetMac,
            zhihu: t.settings.presetZhihu,
            github: t.settings.presetGithub,
            vscode: t.settings.presetVscode,
            notion: t.settings.presetNotion,
            dracula: t.settings.presetDracula,
            custom: t.settings.presetCustom,
          })
          .setValue(this.plugin.settings.codeBlockPreset)
          .onChange(async (value) => {
            this.plugin.settings.codeBlockPreset = value;
            this.plugin.applySettings();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t.settings.customBgColor)
      .setDesc(t.settings.customBgColorDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.customBgColor)
          .onChange(async (value) => {
            this.plugin.settings.customBgColor = value;
            this.plugin.applySettings();
            await this.plugin.saveSettings();
            this.display();
          })
      );

    new Setting(containerEl)
      .setName(t.settings.customRadius)
      .setDesc(t.settings.customRadiusDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.customRadius)
          .onChange(async (value) => {
            this.plugin.settings.customRadius = value;
            this.plugin.applySettings();
            await this.plugin.saveSettings();
            this.display();
          })
      );

    if (this.plugin.settings.customRadius) {
      new Setting(containerEl)
        .setName(t.settings.radius)
        .setDesc(t.settings.radiusDesc)
        .addSlider((slider) =>
          slider
            .setLimits(0, 24, 1)
            .setValue(this.plugin.settings.codeBlockRadius)
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.codeBlockRadius = value;
              this.plugin.applySettings();
              await this.plugin.saveSettings();
            })
        );
    }

    new Setting(containerEl)
      .setName(t.settings.customPadding)
      .setDesc(t.settings.customPaddingDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.customPadding)
          .onChange(async (value) => {
            this.plugin.settings.customPadding = value;
            this.plugin.applySettings();
            await this.plugin.saveSettings();
            this.display();
          })
      );

    if (this.plugin.settings.customPadding) {
      new Setting(containerEl)
        .setName(t.settings.paddingLeft)
        .setDesc(t.settings.paddingLeftDesc)
        .addSlider((slider) =>
          slider
            .setLimits(8, 40, 1)
            .setValue(this.plugin.settings.codeBlockPaddingLeft)
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.codeBlockPaddingLeft = value;
              this.plugin.applySettings();
              await this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName(t.settings.paddingRight)
        .setDesc(t.settings.paddingRightDesc)
        .addSlider((slider) =>
          slider
            .setLimits(8, 40, 1)
            .setValue(this.plugin.settings.codeBlockPaddingRight)
            .setDynamicTooltip()
            .onChange(async (value) => {
              this.plugin.settings.codeBlockPaddingRight = value;
              this.plugin.applySettings();
              await this.plugin.saveSettings();
            })
        );
    }

    new Setting(containerEl)
      .setName(t.settings.showHeaderSeparator)
      .setDesc(t.settings.showHeaderSeparatorDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showHeaderSeparator)
          .onChange(async (value) => {
            this.plugin.settings.showHeaderSeparator = value;
            this.plugin.applySettings();
            await this.plugin.saveSettings();
          })
      );

    // --- Behavior ---
    containerEl.createEl("h3", { text: t.settings.behavior });

    new Setting(containerEl)
      .setName(t.settings.copyOnHover)
      .setDesc(t.settings.copyOnHoverDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.copyButtonOnHover)
          .onChange(async (value) => {
            this.plugin.settings.copyButtonOnHover = value;
            this.plugin.applySettings();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t.settings.chineseTrigger)
      .setDesc(t.settings.chineseTriggerDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.chineseFenceTrigger)
          .onChange(async (value) => {
            this.plugin.settings.chineseFenceTrigger = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t.settings.jumpUpHotkey)
      .setDesc(t.settings.jumpUpHotkeyDesc + " " + t.settings.hotkeyHint)
      .addText((text) =>
        text
          .setPlaceholder("Mod-Shift-b")
          .setValue(this.plugin.settings.jumpUpHotkey)
          .onChange(async (value) => {
            this.plugin.settings.jumpUpHotkey = value.trim() || "Mod-Shift-b";
            this.plugin.applySettings();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t.settings.jumpDownHotkey)
      .setDesc(t.settings.jumpDownHotkeyDesc + " " + t.settings.hotkeyHint)
      .addText((text) =>
        text
          .setPlaceholder("Mod-Shift-a")
          .setValue(this.plugin.settings.jumpDownHotkey)
          .onChange(async (value) => {
            this.plugin.settings.jumpDownHotkey = value.trim() || "Mod-Shift-a";
            this.plugin.applySettings();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t.settings.customLanguage)
      .setDesc(t.settings.customLanguageDesc)
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.allowCustomLanguage)
          .onChange(async (value) => {
            this.plugin.settings.allowCustomLanguage = value;
            await this.plugin.saveSettings();
            this.display(); // refresh to show/hide custom language management
          })
      );

    // --- Custom language management ---
    if (this.plugin.settings.allowCustomLanguage) {
      containerEl.createEl("h3", { text: t.settings.customLanguageManage });

      // Add new custom language
      let newLangInput = "";
      new Setting(containerEl)
        .setName(t.settings.customLanguageAdd)
        .setDesc(t.settings.customLanguageAddDesc)
        .addText((text) =>
          text
            .setPlaceholder("e.g. apex, abap, tcl…")
            .onChange((value) => {
              newLangInput = value.trim();
            })
        )
        .addButton((btn) =>
          btn
            .setButtonText("+")
            .onClick(async () => {
              if (!newLangInput) return;
              if (COMMON_LANGUAGES.includes(newLangInput)) return;
              if (this.plugin.settings.customLanguages.includes(newLangInput)) return;
              this.plugin.settings.customLanguages.push(newLangInput);
              await this.plugin.saveSettings();
              this.display(); // refresh the list
            })
        );

      // List existing custom languages with delete buttons
      const customLangs = this.plugin.settings.customLanguages || [];
      if (customLangs.length === 0) {
        containerEl.createEl("p", {
          text: t.settings.customLanguageEmpty,
          cls: "setting-item-description",
        });
      } else {
        for (const cl of customLangs) {
          new Setting(containerEl)
            .setName(cl)
            .addButton((btn) =>
              btn
                .setButtonText(t.settings.customLanguageDelete)
                .setClass("mod-warning")
                .onClick(async () => {
                  this.plugin.settings.customLanguages =
                    this.plugin.settings.customLanguages.filter((l) => l !== cl);
                  await this.plugin.saveSettings();
                  this.display(); // refresh the list
                })
            );
        }
      }
    }

    // --- Language ---
    containerEl.createEl("h3", { text: t.settings.language });

    new Setting(containerEl)
      .setName(t.settings.language)
      .setDesc(t.settings.languageDesc)
      .addDropdown((dropdown) =>
        dropdown
          .addOption("zh", "中文")
          .addOption("en", "English")
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            // Re-render the settings panel in the new language
            this.display();
          })
      );

    // --- Usage Guide ---
    containerEl.createEl("h3", { text: t.usage.title });
    const usageEl = containerEl.createDiv({ cls: "siyuan-usage-guide" });
    usageEl.style.cssText = "padding: 12px 0; line-height: 1.8; color: var(--text-muted);";
    for (const item of t.usage.items) {
      usageEl.createEl("div", { text: `• ${item}` });
    }
  }
}

/* ============================================================
   Plugin
   ============================================================ */
module.exports = class SiyuanCodeBlocks extends Plugin {
  async onload() {
    await this.loadSettings();
    this.applySettings();

    const plugin = this;

    /* ---- Editing mode: header block widgets ---- */
    const buildDecorations = (state) => {
      const builder = new RangeSetBuilder();
      const doc = state.doc;
      for (const b of parseFences(doc)) {
        const pos = doc.line(b.beginLineNo).from;
        builder.add(
          pos,
          pos,
          Decoration.widget({
            widget: new CodeHeaderWidget(plugin, b),
            block: true,
            side: -1,
          })
        );
      }
      return builder.finish();
    };

    const headerField = StateField.define({
      create: (state) => buildDecorations(state),
      update: (value, tr) => (tr.docChanged ? buildDecorations(tr.state) : value),
      provide: (f) => EditorView.decorations.from(f),
    });

    /* ---- Smart Ctrl/Cmd+A ---- */
    const selectCurrentCodeBlockBody = (view) => {
      const state = view.state;
      const sel = state.selection.main;
      const blocks = parseFences(state.doc);
      const lineNo = state.doc.lineAt(sel.head).number;
      const b = blocks.find((b) => lineNo >= b.beginLineNo && lineNo <= b.endLineNo);
      if (!b) return false;
      if (b.beginLineNo + 1 > b.endLineNo - 1) return false;
      const cFrom = state.doc.line(b.beginLineNo + 1).from;
      const cTo = state.doc.line(b.endLineNo - 1).to;
      if (sel.from === cFrom && sel.to === cTo) return false;
      view.dispatch({ selection: { anchor: cFrom, head: cTo } });
      return true;
    };

    /* ---- Backspace in empty code block deletes the whole block ---- */
    const deleteEmptyBlock = (view) => {
      const state = view.state;
      const sel = state.selection.main;
      // Only works with a collapsed cursor (no selection)
      if (sel.from !== sel.to) return false;

      const lineNo = state.doc.lineAt(sel.head).number;
      const line = state.doc.line(lineNo);

      // Cursor must be on an empty line
      if (line.text.length !== 0) return false;

      const blocks = parseFences(state.doc);
      const b = blocks.find((b) => lineNo >= b.beginLineNo && lineNo <= b.endLineNo);
      if (!b) return false;

      // Must be an empty code block: begin + 1 empty line + end
      if (b.endLineNo - b.beginLineNo !== 2) return false;
      // The cursor must be on the middle empty line
      if (lineNo !== b.beginLineNo + 1) return false;

      // Delete the entire code block (from start of begin line to end of end line)
      // Include the trailing newline to avoid leaving a blank line behind
      const from = state.doc.line(b.beginLineNo).from;
      const endLine = state.doc.line(b.endLineNo);
      const to = endLine.to < state.doc.length ? endLine.to + 1 : endLine.to;
      view.dispatch({
        changes: { from, to, insert: "" },
        selection: { anchor: from },
      });
      return true;
    };

    /* ---- Jump out of code block: configurable hotkeys ---- */
    const jumpOutOfCodeBlockUp = (view) => {
      const state = view.state;
      const sel = state.selection.main;
      const lineNo = state.doc.lineAt(sel.head).number;
      const blocks = parseFences(state.doc);
      const b = blocks.find((b) => lineNo >= b.beginLineNo && lineNo <= b.endLineNo);
      if (!b) return false;
      const targetLine = b.beginLineNo - 1;
      if (targetLine < 1) {
        view.dispatch({ selection: { anchor: 0 } });
      } else {
        const pos = state.doc.line(targetLine).to;
        view.dispatch({ selection: { anchor: pos } });
      }
      return true;
    };

    const jumpOutOfCodeBlockDown = (view) => {
      const state = view.state;
      const sel = state.selection.main;
      const lineNo = state.doc.lineAt(sel.head).number;
      const blocks = parseFences(state.doc);
      const b = blocks.find((b) => lineNo >= b.beginLineNo && lineNo <= b.endLineNo);
      if (!b) return false;
      const targetLine = b.endLineNo + 1;
      if (targetLine > state.doc.lines) {
        view.dispatch({ selection: { anchor: state.doc.length } });
      } else {
        const pos = state.doc.line(targetLine).from;
        view.dispatch({ selection: { anchor: pos } });
      }
      return true;
    };

    /* Parse a CM6 key string like "Mod-Shift-a" into a matcher function */
    const parseKeyBinding = (keyStr) => {
      const parts = keyStr.toLowerCase().split("-");
      const key = parts[parts.length - 1];
      const hasMod = parts.includes("mod");
      const hasShift = parts.includes("shift");
      const hasAlt = parts.includes("alt");
      const hasCtrl = parts.includes("ctrl");
      return (event) => {
        if (event.key.toLowerCase() !== key) return false;
        const modPressed = event.ctrlKey || event.metaKey;
        if (hasMod && !modPressed) return false;
        if (!hasMod && modPressed) return false;
        if (hasShift && !event.shiftKey) return false;
        if (!hasShift && event.shiftKey) return false;
        if (hasAlt && !event.altKey) return false;
        if (!hasAlt && event.altKey) return false;
        if (hasCtrl && !event.ctrlKey) return false;
        return true;
      };
    };

    const jumpKeydown = EditorView.domEventHandlers({
      keydown: (event, view) => {
        const upMatcher = parseKeyBinding(plugin.settings.jumpUpHotkey);
        const downMatcher = parseKeyBinding(plugin.settings.jumpDownHotkey);
        if (upMatcher(event)) {
          if (jumpOutOfCodeBlockUp(view)) {
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
        }
        if (downMatcher(event)) {
          if (jumpOutOfCodeBlockDown(view)) {
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
        }
        return false;
      },
    });

    const isPlainWindowsCtrlA = (event) => {
      // Skip entirely on touch devices (no physical Ctrl key)
      if (isMobilePlatform()) return false;
      const platform = navigator.platform || navigator.userAgent || "";
      return (
        /win/i.test(platform) &&
        event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey &&
        event.key.toLowerCase() === "a"
      );
    };

    const smartSelectAllKeydown = EditorView.domEventHandlers({
      keydown: (event, view) => {
        if (!isPlainWindowsCtrlA(event)) return false;
        if (!selectCurrentCodeBlockBody(view)) return false;
        event.preventDefault();
        event.stopPropagation();
        return true;
      },
    });

    this.registerEditorExtension([
      headerField,
      createFenceTrigger(plugin),
      createEnsureEmptyLine(),
      Prec.highest(smartSelectAllKeydown),
      Prec.highest(jumpKeydown),
      Prec.highest(keymap.of([
        { key: "Mod-a", run: selectCurrentCodeBlockBody },
        { key: "Backspace", run: deleteEmptyBlock },
      ])),
    ]);

    /* ---- Reading mode: header with language label + copy ---- */
    this.registerMarkdownPostProcessor((el) => {
      el.querySelectorAll("pre > code").forEach((code) => {
        const pre = code.parentElement;
        if (!pre || pre.querySelector(".siyuan-code-header")) return;

        const lang = plugin.settings.language || "zh";
        const t = i18n[lang] || i18n.zh;

        let codeLang = "";
        code.classList.forEach((c) => {
          if (c.startsWith("language-")) codeLang = c.slice("language-".length);
        });

        const header = createDiv({ cls: "siyuan-code-header siyuan-code-header-read" });
        header.style.cssText =
          "display:flex;flex-flow:row nowrap;align-items:center;box-sizing:border-box;";
        const pill = header.createDiv({ cls: "siyuan-code-lang" });
        pill.style.cssText = "flex:0 1 auto;width:auto;";
        pill.setText(codeLang || t.langPicker.plainText);

        const copy = header.createDiv({ cls: "siyuan-code-copy" });
        copy.style.cssText = "flex:0 0 auto;width:auto;margin-left:auto;display:inline-flex;align-items:center;";
        setIcon(copy, "copy");
        copy.setAttribute("aria-label", t.notices.copied);
        copy.addEventListener("click", () => copyText(code.textContent || "", lang));

        pre.prepend(header);
      });
    });

    /* ---- Editing-mode hover detection ----
       In CM6, the header widget and code lines are siblings inside .cm-content,
       so CSS :hover on the header only fires when the mouse is directly over it.
       We use JS to detect when the mouse is over any code-block line and add
       .siyuan-code-hover to the corresponding header widget. */
    let _hoveredHeader = null;
    const clearHoveredHeader = () => {
      if (_hoveredHeader) {
        _hoveredHeader.classList.remove("siyuan-code-hover");
        _hoveredHeader = null;
      }
    };
    const setHoveredHeader = (header) => {
      if (_hoveredHeader === header) return;
      clearHoveredHeader();
      if (header) {
        header.classList.add("siyuan-code-hover");
        _hoveredHeader = header;
      }
    };

    this.registerDomEvent(document, "mouseover", (e) => {
      // Skip on touch devices — controls are always visible via CSS class
      if (isMobilePlatform()) return;
      if (!plugin.settings.copyButtonOnHover) return;

      // Check if we're over a code-block line
      const codeLine = e.target.closest(
        ".HyperMD-codeblock, .HyperMD-codeblock-begin, .HyperMD-codeblock-end"
      );
      if (codeLine) {
        // Walk previous siblings to find the header widget for this code block
        let el = codeLine.previousElementSibling;
        while (el) {
          if (el.classList.contains("siyuan-code-header")) {
            setHoveredHeader(el);
            return;
          }
          el = el.previousElementSibling;
        }
        return;
      }

      // Check if we're over a header itself
      const header = e.target.closest(".siyuan-code-header");
      if (header) {
        setHoveredHeader(header);
        return;
      }

      // Not over any code-block area — clear
      clearHoveredHeader();
    });

    /* ---- Settings tab ---- */
    this.addSettingTab(new SiyuanSettingTab(this.app, this));
  }

  onunload() {
    document.documentElement.style.removeProperty("--siyuan-code-radius");
    document.documentElement.style.removeProperty("--siyuan-code-padding-left");
    document.documentElement.style.removeProperty("--siyuan-code-padding-right");
    document.body.classList.remove("siyuan-code-show-copy");
    document.body.classList.remove("siyuan-code-is-mobile");
    document.body.classList.remove("siyuan-code-custom-bg");
    document.body.classList.remove("siyuan-code-custom-radius");
    document.body.classList.remove("siyuan-code-custom-padding");
    document.body.classList.remove("siyuan-code-show-header-separator");
    document.body.classList.remove("siyuan-code-preset-mac");
    document.body.classList.remove("siyuan-code-preset-zhihu");
    document.body.classList.remove("siyuan-code-preset-github");
    document.body.classList.remove("siyuan-code-preset-vscode");
    document.body.classList.remove("siyuan-code-preset-notion");
    document.body.classList.remove("siyuan-code-preset-dracula");
    document.body.classList.remove("siyuan-code-preset-custom");
    document.querySelectorAll(".siyuan-code-hover").forEach((el) => {
      el.classList.remove("siyuan-code-hover");
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  applySettings() {
    document.documentElement.style.setProperty(
      "--siyuan-code-radius",
      this.settings.codeBlockRadius + "px"
    );
    document.documentElement.style.setProperty(
      "--siyuan-code-padding-left",
      this.settings.codeBlockPaddingLeft + "px"
    );
    document.documentElement.style.setProperty(
      "--siyuan-code-padding-right",
      this.settings.codeBlockPaddingRight + "px"
    );
    // Toggle custom style body classes
    document.body.classList.toggle(
      "siyuan-code-custom-bg",
      this.settings.customBgColor
    );
    document.body.classList.toggle(
      "siyuan-code-custom-radius",
      this.settings.customRadius
    );
    document.body.classList.toggle(
      "siyuan-code-custom-padding",
      this.settings.customPadding
    );
    document.body.classList.toggle(
      "siyuan-code-show-header-separator",
      this.settings.showHeaderSeparator
    );
    document.body.classList.toggle(
      "siyuan-code-preset-mac",
      this.settings.codeBlockPreset === "mac"
    );
    document.body.classList.toggle(
      "siyuan-code-preset-zhihu",
      this.settings.codeBlockPreset === "zhihu"
    );
    document.body.classList.toggle(
      "siyuan-code-preset-github",
      this.settings.codeBlockPreset === "github"
    );
    document.body.classList.toggle(
      "siyuan-code-preset-vscode",
      this.settings.codeBlockPreset === "vscode"
    );
    document.body.classList.toggle(
      "siyuan-code-preset-notion",
      this.settings.codeBlockPreset === "notion"
    );
    document.body.classList.toggle(
      "siyuan-code-preset-dracula",
      this.settings.codeBlockPreset === "dracula"
    );
    document.body.classList.toggle(
      "siyuan-code-preset-custom",
      this.settings.codeBlockPreset === "custom"
    );
    // Always show copy button on mobile (no cursor hover)
    const mobile = isMobilePlatform();
    document.body.classList.toggle(
      "siyuan-code-show-copy",
      mobile || !this.settings.copyButtonOnHover
    );
    document.body.classList.toggle(
      "siyuan-code-is-mobile",
      mobile
    );
  }
};
