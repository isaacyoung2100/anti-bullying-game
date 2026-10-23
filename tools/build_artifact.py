"""把遊戲打包成單一 HTML 檔，方便放到 Claude Artifacts 或任何只能放一個檔案的地方分享。

用法：python tools/build_artifact.py
輸出：dist/artifact.html

做法：把 CSS 和所有 JS 模組內嵌進同一個檔案。各角色故事包成各自的函式範圍，
避免 STORY、ENDINGS 等名稱互相衝突。
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend"
OUT = ROOT / "dist" / "artifact.html"

STORY_IDS = ["azhe", "xiaoyu", "aming", "kai", "qing", "pinyu"]

# Artifacts 會自動加上 <html>/<head>，並在上下保留手機安全區域；
# 這裡補上左右留白，並讓畫面高度跟著可用空間走
ARTIFACT_CSS = """
:root { color-scheme: light; }
html, body { height: 100%; }
body {
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}
.stage { height: 100%; max-width: calc((100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) * 9 / 16); }
.hud { padding-top: 2.4cqw; }
.panel { padding-top: 15cqw; }
"""


def strip_module(code: str) -> str:
    code = re.sub(r"^import[\s\S]*?from\s+'[^']+';\n", "", code, flags=re.M)
    return re.sub(r"^export\s+(const|function|default)\b", r"\1", code, flags=re.M)


def story_module(story_id: str) -> str:
    code = (SRC / "js" / "stories" / f"{story_id}.js").read_text(encoding="utf-8")
    code = code.replace("export default {", "return {")
    return f"const {story_id} = (() => {{\n{code}\n}})();\n"


def main():
    css = (SRC / "css" / "style.css").read_text(encoding="utf-8")
    index = (SRC / "index.html").read_text(encoding="utf-8")
    body = re.search(r"<body>([\s\S]*?)<script", index).group(1).strip()

    js = "\n".join([
        strip_module((SRC / "js" / "sprites.js").read_text(encoding="utf-8")),
        *[story_module(sid) for sid in STORY_IDS],
        strip_module((SRC / "js" / "story.js").read_text(encoding="utf-8")),
        strip_module((SRC / "js" / "lang" / "story_en.js").read_text(encoding="utf-8")),
        strip_module((SRC / "js" / "i18n.js").read_text(encoding="utf-8")),
        strip_module((SRC / "js" / "game.js").read_text(encoding="utf-8")),
    ])

    page = f"""<title>五年三班大隊接力</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;700&family=Patrick+Hand&display=swap" rel="stylesheet">
<style>
{css}
{ARTIFACT_CSS}
</style>
{body}
<script type="module">
{js}
</script>
"""
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(page.encode('utf-8')) // 1024} KB)")


if __name__ == "__main__":
    main()
