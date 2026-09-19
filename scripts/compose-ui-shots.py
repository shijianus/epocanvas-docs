# -*- coding: utf-8 -*-
"""
界面截图本地化合成脚本。

输入：.cf-work/shots/<locale>/ 下的底图 PNG 与 _spec.json（浏览器采集的锚点矩形）。
输出：public/images/canvas/<locale>/ 下的标注截图（root 语言直接覆盖中文原图）。

标注绘制定义在本文件 LABELS / GEOMETRY 里：每个图形给出一组
（圆点锚点, 胶囊锚点, 标签序号）。锚点坐标优先取自 _spec.json 里
对应元素的实时矩形，保证在不同语言（按钮文字长度不同）下都对位。
重制截图的流程：浏览器批量截图到 .cf-work/shots/<locale>/ → 运行本脚本 → 重新构建。

采集要求：必须在页面完全渲染后才能截图——等待 networkidle，确认正文、
右侧目录、Pagefind 检索弹窗（它在 requestIdleCallback 里才挂载）等内容
均已出现。过早截图会得到近乎纯色的空白帧。本脚本对每张输入图做空白帧
检测，发现空白帧会直接报错终止，不会覆盖 public/ 下的正常图片。
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, ".cf-work", "shots")
OUT_BASE = os.path.join(ROOT, "public", "images", "canvas")

FONT_CJK = "C:/Windows/Fonts/msyhbd.ttc"
FONT_KO = "C:/Windows/Fonts/malgunbd.ttf"
FONT_LATIN = "C:/Windows/Fonts/segoeuib.ttf"

# 各语言 UI 标签。键顺序与 GEOMETRY 里 callouts 的序号一一对应。
# 语言名、GitHub、Telegram 等专名不翻译。
LABELS = {
    "ui-layout-annotated": {
        "zh-CN": ["顶部全局导航栏", "左侧分类目录", "中央正文阅读区", "右侧本页目录"],
        "zh-TW": ["頂部全域導覽列", "左側分類目錄", "中央正文閱讀區", "右側本頁目錄"],
        "en": ["Top navigation bar", "Left sidebar", "Main content area", "On this page"],
        "ja": ["グローバルナビゲーション", "左サイドバー", "本文エリア", "目次"],
        "ko": ["상단 내비게이션", "왼쪽 사이드바", "본문 영역", "이 페이지 목차"],
        "es": ["Barra de navegación", "Barra lateral izquierda", "Área de contenido", "Índice de la página"],
        "fr": ["Barre de navigation", "Menu latéral", "Zone de contenu", "Sommaire de la page"],
        "de": ["Obere Navigation", "Linke Seitenleiste", "Inhaltsbereich", "Auf dieser Seite"],
        "ru": ["Верхняя навигация", "Левое меню", "Область статьи", "Содержание страницы"],
        "pt": ["Barra de navegação", "Barra lateral esquerda", "Área de conteúdo", "Nesta página"],
    },
    "ui-topnav-annotated": {
        "zh-CN": ["Logo 与站点名", "搜索框（页内查找）", "主导航按钮", "版本徽标", "语言切换", "主题切换", "GitHub", "Telegram"],
        "zh-TW": ["Logo 與站點名", "搜尋框（頁內查詢）", "主導覽按鈕", "版本標籤", "語言切換", "主題切換", "GitHub", "Telegram"],
        "en": ["Logo & site name", "Search box (in-page)", "Main navigation", "Version badge", "Language switcher", "Theme toggle", "GitHub", "Telegram"],
        "ja": ["ロゴとサイト名", "検索ボックス（ページ内）", "メインナビゲーション", "バージョン表示", "言語切替", "テーマ切替", "GitHub", "Telegram"],
        "ko": ["로고와 사이트명", "검색창(페이지 내)", "주 내비게이션", "버전 배지", "언어 전환", "테마 전환", "GitHub", "Telegram"],
        "es": ["Logotipo y nombre", "Buscador (en página)", "Navegación principal", "Insignia de versión", "Selector de idioma", "Cambio de tema", "GitHub", "Telegram"],
        "fr": ["Logo et nom du site", "Recherche (dans la page)", "Navigation principale", "Badge de version", "Sélecteur de langue", "Bascule de thème", "GitHub", "Telegram"],
        "de": ["Logo & Sitename", "Suchfeld (auf der Seite)", "Hauptnavigation", "Versions-Badge", "Sprachwahl", "Design-Umschalter", "GitHub", "Telegram"],
        "ru": ["Логотип и название", "Поиск (на странице)", "Главная навигация", "Значок версии", "Выбор языка", "Переключение темы", "GitHub", "Telegram"],
        "pt": ["Logotipo e nome", "Caixa de busca (na página)", "Navegação principal", "Selo de versão", "Seletor de idioma", "Alternar tema", "GitHub", "Telegram"],
    },
    "ui-i18n-open": {
        "zh-CN": ["语言切换按钮", "10 种语言下拉列表", "当前语言"],
        "zh-TW": ["語言切換按鈕", "10 種語言下拉清單", "當前語言"],
        "en": ["Language switcher button", "10-language dropdown list", "Current language"],
        "ja": ["言語切替ボタン", "10 言語のドロップダウン", "現在の言語"],
        "ko": ["언어 전환 버튼", "10개 언어 드롭다운", "현재 언어"],
        "es": ["Botón de idioma", "Lista de 10 idiomas", "Idioma actual"],
        "fr": ["Bouton de langue", "Liste des 10 langues", "Langue actuelle"],
        "de": ["Sprachschalter", "Liste mit 10 Sprachen", "Aktuelle Sprache"],
        "ru": ["Кнопка выбора языка", "Список 10 языков", "Текущий язык"],
        "pt": ["Botão de idioma", "Lista de 10 idiomas", "Idioma atual"],
    },
    "ui-search-modal": {
        "zh-CN": ["Ctrl K 徽标：呼出全站检索", "检索输入框", "按文档分组的结果列表", "键盘快捷键"],
        "zh-TW": ["Ctrl K 標籤：呼出全站檢索", "檢索輸入框", "按文件分組的結果清單", "鍵盤快捷鍵"],
        "en": ["Ctrl K badge: opens site search", "Search input box", "Results grouped by page", "Keyboard shortcuts"],
        "ja": ["Ctrl K バッジ：全体検索を開く", "検索入力欄", "ページ別の結果リスト", "キーボードショートカット"],
        "ko": ["Ctrl K 배지: 전체 검색 열기", "검색 입력창", "문서별 결과 목록", "키보드 단축키"],
        "es": ["Insignia Ctrl K: abre la búsqueda", "Campo de búsqueda", "Resultados agrupados por página", "Atajos de teclado"],
        "fr": ["Badge Ctrl K : ouvre la recherche", "Champ de recherche", "Résultats groupés par page", "Raccourcis clavier"],
        "de": ["Ctrl-K-Symbol: Suche öffnen", "Sucheingabefeld", "Nach Seiten gruppierte Treffer", "Tastenkürzel"],
        "ru": ["Значок Ctrl K: открыть поиск", "Поле поиска", "Результаты по страницам", "Горячие клавиши"],
        "pt": ["Selo Ctrl K: abre a busca", "Campo de busca", "Resultados por página", "Atalhos de teclado"],
    },
    "ui-inpage-search": {
        "zh-CN": ["顶栏输入框：输入关键词", "匹配计数", "上/下一处", "清除", "页面内匹配文字自动高亮"],
        "zh-TW": ["頂欄輸入框：輸入關鍵詞", "匹配計數", "上/下一處", "清除", "頁面內匹配文字自動高亮"],
        "en": ["Header input: type a keyword", "Match counter", "Prev/next match", "Clear", "Matches highlighted on the page"],
        "ja": ["ヘッダー入力欄：キーワード入力", "一致カウント", "前/次へ", "クリア", "ページ内の一致を自動ハイライト"],
        "ko": ["상단 입력창: 키워드 입력", "일치 개수", "이전/다음", "지우기", "본문 일치 자동 강조"],
        "es": ["Campo superior: escribe una palabra", "Contador de coincidencias", "Anterior/siguiente", "Borrar", "Coincidencias resaltadas en la página"],
        "fr": ["Champ supérieur : tapez un mot", "Compteur de correspondances", "Précédent/suivant", "Effacer", "Correspondances surlignées dans la page"],
        "de": ["Kopfzeilen-Eingabe: Stichwort eingeben", "Trefferzähler", "Vor/zurück", "Löschen", "Treffer werden auf der Seite hervorgehoben"],
        "ru": ["Поле в шапке: введите слово", "Счётчик совпадений", "Назад/вперёд", "Очистить", "Совпадения подсвечены на странице"],
        "pt": ["Campo superior: digite uma palavra", "Contador de correspondências", "Anterior/próxima", "Limpar", "Correspondências destacadas na página"],
    },
}

LOCALES = [
    ("root", "zh-CN", ""),
    ("zh-tw", "zh-TW", "zh-tw"),
    ("en", "en", "en"),
    ("ja", "ja", "ja"),
    ("ko", "ko", "ko"),
    ("es", "es", "es"),
    ("fr", "fr", "fr"),
    ("de", "de", "de"),
    ("ru", "ru", "ru"),
    ("pt", "pt", "pt"),
]


# 空白帧判定阈值：正常截图含大量文字/控件，灰度标准差远高于该值；
# 未渲染完成的空白帧只有背景与侧栏两块纯色，标准差接近 0。
BLANK_STDDEV_THRESHOLD = 8.0


def assert_not_blank(path):
	"""空白帧检测：灰度标准差过低说明截图近乎纯色（采集时机过早、内容未渲染）。
	直接终止流程而不是照常覆盖 public/ 下的正常图片，避免坏图静默上线。"""
	img = Image.open(path).convert("L")
	img.thumbnail((200, 200))
	stddev = ImageStat.Stat(img).stddev[0]
	if stddev < BLANK_STDDEV_THRESHOLD:
		raise SystemExit(
			f"[blank] {path} 近乎纯色（灰度标准差 {stddev:.2f} < {BLANK_STDDEV_THRESHOLD}），"
			"疑似未渲染完成的空白截图；请检查采集时机（需等待正文与 Pagefind 渲染完成）后重试。"
		)


def font_for(code, size):
    path = FONT_KO if code == "ko" else (FONT_LATIN if code in ("en", "es", "fr", "de", "ru", "pt") else FONT_CJK)
    return ImageFont.truetype(path, size)


def draw_circle(draw, cx, cy, num, f, fill, ring):
    r = 14
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=ring, width=2)
    draw.text((cx, cy), str(num), font=f, fill="white", anchor="mm")


def draw_pill(draw, cx, cy, text, f, fill, clamp_x):
    tw = draw.textlength(text, font=f)
    th = f.size
    pad_x, pad_y = 13, 7
    w, h = tw + 2 * pad_x, th + 2 * pad_y
    cx = min(max(cx, w / 2 + 4), clamp_x - w / 2 - 4)
    box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
    draw.rounded_rectangle(box, radius=8, fill=fill)
    draw.text((cx, cy - 1), text, font=f, fill="white", anchor="mm")


def R(rects, key, fallback=None):
    r = rects.get(key)
    if r:
        return r
    if fallback is None:
        raise KeyError(f"missing rect: {key}")
    return fallback


def center(r):
    return (r["x"] + r["w"] / 2, r["y"] + r["h"] / 2)


def geo_layout(rects, W, clamp_x):
    header = R(rects, "header", {"x": 0, "y": 0, "w": 1430, "h": 56})
    sidebar = R(rects, "sidebar", {"x": 0, "y": 56, "w": 264, "h": 864})
    main = R(rects, "main", {"x": 288, "y": 300, "w": 782, "h": 600})
    toc = R(rects, "toc", {"x": 1114, "y": 84, "w": 280, "h": 268})
    return [
        ((479, 28), (588, 74)),
        ((27, sidebar["y"] + 344), (101, sidebar["y"] + 381)),
        ((main["x"] + 412, 160), (main["x"] + 514, 163)),
        ((toc["x"] + 121, toc["y"] + 216), (toc["x"] + 211, toc["y"] + 219)),
    ]


def geo_topnav(rects, W, clamp_x):
    s = 1.5
    title = R(rects, "title")
    search = R(rects, "search")
    nav = R(rects, "nav")
    badge = R(rects, "badge")
    lang = R(rects, "lang")
    theme = R(rects, "theme")
    gh = R(rects, "github")
    tg = R(rects, "tg")
    hy = 42
    return [
        ((title["x"] + title["w"] + 8) * s, hy),
        (center(search)[0] * s, hy),
        (center(nav)[0] * s, hy),
        ((badge["x"] + badge["w"] + 6) * s, hy),
        (center(lang)[0] * s, hy),
        (center(theme)[0] * s, hy),
        (center(gh)[0] * s, hy),
        (center(tg)[0] * s, hy),
    ], None


def geo_i18n(rects, W, clamp_x):
    btn = R(rects, "btn")
    menu = R(rects, "menu")
    active = R(rects, "active")
    px = menu["x"] + menu["w"] + 55
    return [
        ((btn["x"] + btn["w"] - 10, center(btn)[1]), (px, btn["y"] + btn["h"] + 26)),
        ((center(menu)[0], menu["y"] + menu["h"] - 22), (center(menu)[0], menu["y"] + menu["h"] + 40)),
        ((menu["x"] + menu["w"] + 8, center(active)[1]), (px, btn["y"] + btn["h"] + 66)),
    ]


def geo_modal(rects, W, clamp_x):
    inp = R(rects, "input")
    results = R(rects, "results")
    footer = R(rects, "footer")
    return [
        ((988, 29), (1160, 29)),
        ((inp["x"] + inp["w"] - 16, center(inp)[1]), (inp["x"] + inp["w"] + 90, center(inp)[1])),
        ((results["x"] + results["w"] - 6, results["y"] + 180), (results["x"] + results["w"] + 95, results["y"] + 180)),
        ((footer["x"] + 240, center(footer)[1]), (footer["x"] + 328, center(footer)[1])),
    ]


def geo_inpage(rects, W, clamp_x):
    box = R(rects, "input")
    count = R(rects, "count")
    prev = R(rects, "prev")
    nxt = R(rects, "next")
    clear = R(rects, "clear")
    mark = R(rects, "mark")
    yc = box["y"] + box["h"] + 12
    yp = box["y"] + box["h"] + 52
    return [
        ((box["x"] + 33, yc), (box["x"] + 150, yp)),
        ((center(count)[0], yc), (center(count)[0] + 93, yp)),
        (((center(prev)[0] + center(nxt)[0]) / 2, yc), (center(nxt)[0] + 105, yp)),
        ((center(clear)[0], yc), (center(clear)[0] + 229, yp)),
        ((center(mark)[0], center(mark)[1]), (center(mark)[0] + 16, center(mark)[1] + 47)),
    ]


GEOMETRY = {
    "ui-layout-annotated": geo_layout,
    "ui-topnav-annotated": geo_topnav,
    "ui-i18n-open": geo_i18n,
    "ui-search-modal": geo_modal,
    "ui-inpage-search": geo_inpage,
}
PLAIN = ["ui-docs-reading", "ui-quickstart", "ui-markup-examples", "ui-theme-light"]
# 顶栏特写的原始截图文件名（裁剪自页面顶部，合成时再放大）
SRC_NAME = {"ui-topnav-annotated": "ui-topnav-raw.png"}

BLUE_PILL = (37, 99, 235)
BLUE_RING = (219, 234, 254)
AMBER_PILL = (245, 158, 11)
AMBER_RING = (253, 230, 138)
AMBER_TEXT = (30, 27, 20)


def compose_annotated(locale_dir, code, figure, scale=1):
    src = os.path.join(SHOTS, locale_dir, SRC_NAME.get(figure, figure + ".png"))
    spec = json.load(open(os.path.join(SHOTS, locale_dir, "_spec.json"), encoding="utf-8"))
    rects = spec["figures"][figure]["rects"]
    labels = LABELS[figure][code]
    geo_fn = GEOMETRY[figure]
    img = Image.open(src).convert("RGB")
    W = img.width
    f_pill = font_for(code, round(20 * scale))
    f_num = font_for(code, round(15 * scale))
    if figure == "ui-topnav-annotated":
        # 顶栏特写：从整屏截图裁出页头条（规避裁剪参数在不同像素比下的错位），
        # 1.5 倍放大后贴到 216x216 纯色画布上，胶囊画在补齐区
        img = img.crop((0, 0, 1440, 144))
        raw = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
        canvas = Image.new("RGB", (2160, 216), (11, 15, 25))
        canvas.paste(raw, (0, 0))
        img = canvas
        f_pill = font_for(code, 22)
        f_num = font_for(code, 15)
    draw = ImageDraw.Draw(img)
    amber = figure == "ui-topnav-annotated"
    pill_fill = AMBER_PILL if amber else BLUE_PILL
    ring = AMBER_RING if amber else BLUE_RING
    num_color = AMBER_TEXT if amber else "white"
    anchors = geo_fn(rects, img.width, img.width - 8)
    if figure == "ui-topnav-annotated":
        circles, _ = anchors
        # 胶囊分两行排在补齐区：前 6 个一行，后 2 个一行
        rows = [labels[:6], labels[6:]]
        for ri, row in enumerate(rows):
            widths = [draw.textlength(t, font=f_pill) + 26 for t in row]
            total = sum(widths) + 24 * (len(row) - 1)
            x = (img.width - total) / 2
            y = 128 + ri * 48
            for t, w in zip(row, widths):
                box = [x, y - 17, x + w, y + 17]
                draw.rounded_rectangle(box, radius=8, fill=pill_fill)
                draw.text((x + w / 2, y - 1), t, font=f_pill, fill=num_color, anchor="mm")
                x += w + 24
        for i, (cx, cy) in enumerate(circles):
            draw_circle(draw, cx, cy, i + 1, f_num, pill_fill, ring)
    else:
        for i, ((cx, cy), (px, py)) in enumerate(anchors):
            draw_circle(draw, cx, cy, i + 1, f_num, pill_fill, ring)
            draw_pill(draw, px, py, labels[i], f_pill, pill_fill, img.width - 8)
    return img


def main():
    only = [a for a in os.sys.argv[1:]] if len(os.sys.argv) > 1 else None
    for locale_dir, code, pub in LOCALES:
        if only and locale_dir not in only:
            continue
        out_dir = os.path.join(OUT_BASE, pub) if pub else OUT_BASE
        os.makedirs(out_dir, exist_ok=True)
        for figure in PLAIN:
            src = os.path.join(SHOTS, locale_dir, figure + ".png")
            if not os.path.exists(src):
                print(f"[skip] {locale_dir}/{figure} (no capture)")
                continue
            assert_not_blank(src)
            Image.open(src).convert("RGB").save(os.path.join(out_dir, figure + ".png"), optimize=True)
            print(f"[ok] {locale_dir}/{figure}")
        for figure in GEOMETRY:
            src = os.path.join(SHOTS, locale_dir, SRC_NAME.get(figure, figure + ".png"))
            if not os.path.exists(src):
                print(f"[skip] {locale_dir}/{figure} (no capture)")
                continue
            assert_not_blank(src)
            img = compose_annotated(locale_dir, code, figure)
            img.save(os.path.join(out_dir, figure + ".png"), optimize=True)
            print(f"[ok] {locale_dir}/{figure} (annotated)")


if __name__ == "__main__":
    main()
