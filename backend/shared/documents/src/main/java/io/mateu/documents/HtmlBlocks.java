package io.mateu.documents;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;

/**
 * Reads HTML into the flat list of blocks {@link PdfLayout} lays out — the documented subset:
 * headings, paragraphs and divs, line breaks, bold/italic, lists, tables (with repeated header rows
 * and column widths in %), horizontal rules, page breaks and {@code data:} images. Anything else is
 * read for its text.
 */
final class HtmlBlocks {

  /** A piece of text with its emphasis. {@code "\n"} is a forced line break. */
  record Run(String text, boolean bold, boolean italic) {}

  sealed interface Block permits Para, Rule, PageBreak, Table, Image {}

  /** A paragraph: runs wrapped to the width, with its own size, alignment and spacing. */
  record Para(
      List<Run> runs,
      float size,
      String align,
      float before,
      float after,
      float indent,
      String bullet)
      implements Block {}

  record Rule() implements Block {}

  record PageBreak() implements Block {}

  record Cell(List<Run> runs, String align, int colspan) {}

  record Row(List<Cell> cells, boolean header) {}

  /** A table; {@code widths} are fractions of the available width, one per column. */
  record Table(List<Row> rows, float[] widths) implements Block {}

  record Image(byte[] bytes, float widthPt) implements Block {}

  static final float BODY = 10f;

  private static final Set<String> INLINE =
      Set.of(
          "b", "strong", "i", "em", "span", "a", "u", "small", "sup", "sub", "code", "font",
          "label", "mark", "abbr", "time", "s", "del", "ins", "kbd", "var", "q", "cite");
  private static final Set<String> IGNORED =
      Set.of("head", "script", "style", "title", "meta", "link", "template", "noscript");
  private static final Pattern WIDTH = Pattern.compile("width\\s*:\\s*([0-9.]+)\\s*(%|px|pt)");
  private static final Pattern ALIGN = Pattern.compile("text-align\\s*:\\s*(left|right|center)");

  private HtmlBlocks() {}

  static List<Block> read(String html) {
    var body = Jsoup.parse(html == null ? "" : html).body();
    List<Block> out = new ArrayList<>();
    List<Run> runs = new ArrayList<>();
    var style = new Style(BODY, false, false, "left", 0);
    children(body, style, out, runs);
    flush(runs, style, 0, 4, null, out);
    return out;
  }

  /** The inherited style of the text being read. */
  record Style(float size, boolean bold, boolean italic, String align, float indent) {
    Style bold(boolean v) {
      return new Style(size, v, italic, align, indent);
    }

    Style italic(boolean v) {
      return new Style(size, bold, v, align, indent);
    }

    Style size(float v) {
      return new Style(v, bold, italic, align, indent);
    }

    Style align(String v) {
      return new Style(size, bold, italic, v == null ? align : v, indent);
    }

    Style indent(float v) {
      return new Style(size, bold, italic, align, v);
    }
  }

  private static void children(Element el, Style style, List<Block> out, List<Run> runs) {
    for (Node node : el.childNodes()) {
      if (node instanceof TextNode text) {
        String value = el.normalName().equals("pre") ? text.getWholeText() : text.text();
        if (el.normalName().equals("pre")) {
          String[] lines = value.split("\n", -1);
          for (int i = 0; i < lines.length; i++) {
            if (i > 0) {
              runs.add(new Run("\n", false, false));
            }
            runs.add(new Run(lines[i], style.bold(), style.italic()));
          }
        } else if (!value.isEmpty()) {
          runs.add(new Run(value, style.bold(), style.italic()));
        }
      } else if (node instanceof Element child) {
        element(child, style, out, runs);
      }
    }
  }

  private static void element(Element e, Style style, List<Block> out, List<Run> runs) {
    String tag = e.normalName();
    if (IGNORED.contains(tag)) {
      return;
    }
    if (breaksBefore(e)) {
      flush(runs, style, 0, 4, null, out);
      out.add(new PageBreak());
    }
    switch (tag) {
      case "br" -> runs.add(new Run("\n", false, false));
      case "b", "strong", "th" -> children(e, style.bold(true), out, runs);
      case "i", "em", "cite", "var" -> children(e, style.italic(true), out, runs);
      case "hr" -> {
        flush(runs, style, 0, 4, null, out);
        out.add(new Rule());
      }
      case "img" -> {
        flush(runs, style, 0, 4, null, out);
        var image = image(e);
        if (image != null) {
          out.add(image);
        }
      }
      case "h1", "h2", "h3", "h4", "h5", "h6" -> {
        flush(runs, style, 0, 4, null, out);
        float size =
            switch (tag) {
              case "h1" -> 20f;
              case "h2" -> 16f;
              case "h3" -> 13f;
              default -> 11f;
            };
        var heading = style.size(size).bold(true).align(alignOf(e));
        children(e, heading, out, runs);
        flush(runs, heading, size * 0.6f, size * 0.35f, null, out);
      }
      case "ul", "ol" -> {
        flush(runs, style, 0, 4, null, out);
        int n = 0;
        var item = style.indent(style.indent() + 16);
        for (Element li : e.children()) {
          if (!li.normalName().equals("li")) {
            continue;
          }
          n++;
          children(li, item, out, runs);
          flush(runs, item, 0, 2, tag.equals("ol") ? n + "." : "•", out);
        }
      }
      case "table" -> {
        flush(runs, style, 0, 4, null, out);
        var table = table(e, style);
        if (table != null) {
          out.add(table);
        }
      }
      default -> {
        if (INLINE.contains(tag)) {
          children(e, style, out, runs);
        } else {
          // a block: p, div, section, header, footer, blockquote, pre, address, li outside a list…
          flush(runs, style, 0, 4, null, out);
          var block = style.align(alignOf(e));
          if (tag.equals("blockquote")) {
            block = block.indent(block.indent() + 16).italic(true);
          }
          children(e, block, out, runs);
          flush(runs, block, 0, tag.equals("p") ? 6 : 2, null, out);
        }
      }
    }
  }

  private static void flush(
      List<Run> runs, Style style, float before, float after, String bullet, List<Block> out) {
    boolean blank = runs.stream().allMatch(r -> r.text().isBlank());
    if (!blank) {
      out.add(
          new Para(
              List.copyOf(runs),
              style.size(),
              style.align(),
              before,
              after,
              style.indent(),
              bullet));
    }
    runs.clear();
  }

  private static Table table(Element table, Style style) {
    List<Row> rows = new ArrayList<>();
    List<Float> widths = new ArrayList<>();
    for (Element section : table.children()) {
      String name = section.normalName();
      if (name.equals("caption")) {
        continue;
      }
      List<Element> trs = name.equals("tr") ? List.of(section) : section.children();
      for (Element tr : trs) {
        if (!tr.normalName().equals("tr")) {
          continue;
        }
        List<Cell> cells = new ArrayList<>();
        boolean allTh = true;
        for (Element cell : tr.children()) {
          String tag = cell.normalName();
          if (!tag.equals("td") && !tag.equals("th")) {
            continue;
          }
          allTh &= tag.equals("th");
          List<Run> runs = new ArrayList<>();
          var cellStyle = style.bold(tag.equals("th")).align(alignOf(cell));
          if (cellStyle.align() == null) {
            cellStyle = cellStyle.align("left");
          }
          collectInline(cell, cellStyle, runs);
          int span = Math.max(1, parseInt(cell.attr("colspan")));
          cells.add(new Cell(runs, cellStyle.align(), span));
          if (rows.isEmpty()) {
            float w = widthOf(cell);
            for (int i = 0; i < span; i++) {
              widths.add(w / span);
            }
          }
        }
        if (!cells.isEmpty()) {
          rows.add(
              new Row(
                  cells, name.equals("thead") || (allTh && rows.stream().allMatch(Row::header))));
        }
      }
    }
    if (rows.isEmpty()) {
      return null;
    }
    int columns =
        rows.stream()
            .mapToInt(r -> r.cells().stream().mapToInt(Cell::colspan).sum())
            .max()
            .orElse(1);
    while (widths.size() < columns) {
      widths.add(-1f);
    }
    float declared = 0;
    int undeclared = 0;
    for (float w : widths) {
      if (w > 0) {
        declared += w;
      } else {
        undeclared++;
      }
    }
    float rest = Math.max(0, 1 - declared);
    float[] fractions = new float[columns];
    for (int i = 0; i < columns; i++) {
      float w = widths.get(i);
      fractions[i] = w > 0 ? w : (undeclared == 0 ? 0 : rest / undeclared);
    }
    float sum = 0;
    for (float f : fractions) {
      sum += f;
    }
    for (int i = 0; i < columns; i++) {
      fractions[i] = sum <= 0 ? 1f / columns : fractions[i] / sum;
    }
    return new Table(rows, fractions);
  }

  /** The text of a table cell, block children read as line breaks. */
  private static void collectInline(Element el, Style style, List<Run> runs) {
    for (Node node : el.childNodes()) {
      if (node instanceof TextNode text) {
        if (!text.text().isEmpty()) {
          runs.add(new Run(text.text(), style.bold(), style.italic()));
        }
      } else if (node instanceof Element child) {
        String tag = child.normalName();
        if (IGNORED.contains(tag)) {
          continue;
        }
        if (tag.equals("br")) {
          runs.add(new Run("\n", false, false));
        } else if (tag.equals("b") || tag.equals("strong")) {
          collectInline(child, style.bold(true), runs);
        } else if (tag.equals("i") || tag.equals("em")) {
          collectInline(child, style.italic(true), runs);
        } else if (INLINE.contains(tag)) {
          collectInline(child, style, runs);
        } else {
          if (!runs.isEmpty()) {
            runs.add(new Run("\n", false, false));
          }
          collectInline(child, style, runs);
        }
      }
    }
  }

  private static boolean breaksBefore(Element e) {
    String css = e.attr("style").toLowerCase(Locale.ROOT).replace(" ", "");
    return css.contains("page-break-before:always") || css.contains("break-before:page");
  }

  private static String alignOf(Element e) {
    String attr = e.attr("align").toLowerCase(Locale.ROOT);
    if (attr.equals("left") || attr.equals("right") || attr.equals("center")) {
      return attr;
    }
    Matcher m = ALIGN.matcher(e.attr("style").toLowerCase(Locale.ROOT));
    return m.find() ? m.group(1) : null;
  }

  private static float widthOf(Element cell) {
    String attr = cell.attr("width").trim();
    if (attr.endsWith("%")) {
      return parseFloat(attr.substring(0, attr.length() - 1)) / 100f;
    }
    Matcher m = WIDTH.matcher(cell.attr("style").toLowerCase(Locale.ROOT));
    if (m.find() && m.group(2).equals("%")) {
      return parseFloat(m.group(1)) / 100f;
    }
    return -1f;
  }

  private static Image image(Element img) {
    String src = img.attr("src");
    int comma = src.indexOf(',');
    if (!src.startsWith("data:image/")
        || comma < 0
        || !src.substring(0, comma).endsWith(";base64")) {
      return null; // only embedded images: a renderer that fetched URLs would be an SSRF door
    }
    try {
      byte[] bytes = Base64.getMimeDecoder().decode(src.substring(comma + 1));
      float width = 0;
      String w = img.attr("width").replace("px", "").trim();
      if (!w.isEmpty()) {
        width = parseFloat(w) * 0.75f;
      } else {
        Matcher m = WIDTH.matcher(img.attr("style").toLowerCase(Locale.ROOT));
        if (m.find() && !m.group(2).equals("%")) {
          width = parseFloat(m.group(1)) * (m.group(2).equals("px") ? 0.75f : 1f);
        }
      }
      return new Image(bytes, width);
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private static int parseInt(String value) {
    try {
      return Integer.parseInt(value.trim());
    } catch (NumberFormatException e) {
      return 1;
    }
  }

  private static float parseFloat(String value) {
    try {
      return Float.parseFloat(value.trim());
    } catch (NumberFormatException e) {
      return -1f;
    }
  }
}
