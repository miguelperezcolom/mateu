package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import lombok.Builder;

/**
 * A file a {@link io.mateu.uidl.interfaces.FileStorage} keeps. An upload field's value is its
 * {@link #toValue() reference string}, {@code
 * mateu-file:<id>?name=<name>&type=<type>&size=<bytes>&url=<url>} (each part percent-encoded,
 * absent or empty parts left out): self-describing, so a renderer can show the name and size and
 * link to the url, and a plain {@code String} (or {@code List<String>}) field holds it. Read it
 * back with {@link #parse}.
 *
 * @param id the store's own key for the file (required)
 * @param name the file name to show
 * @param contentType its media type
 * @param size its size in bytes, or {@code -1} when unknown
 * @param url where the user can open it (http(s)), or null
 */
@Experimental("file uploads through a storage port (3.0)")
@Builder
public record StoredFile(String id, String name, String contentType, long size, String url) {

  /** The scheme of a reference string. */
  public static final String SCHEME = "mateu-file:";

  /** The reference string a field holds. */
  public String toValue() {
    var out = new StringBuilder(SCHEME).append(encode(id));
    var params = new LinkedHashMap<String, String>();
    params.put("name", name);
    params.put("type", contentType);
    params.put("size", size >= 0 ? String.valueOf(size) : null);
    params.put("url", url);
    char separator = '?';
    for (var param : params.entrySet()) {
      if (param.getValue() == null || param.getValue().isEmpty()) {
        continue;
      }
      out.append(separator).append(param.getKey()).append('=').append(encode(param.getValue()));
      separator = '&';
    }
    return out.toString();
  }

  /**
   * The file a reference string refers to, or null when the value is not one (blank, a data URI, a
   * plain url…).
   */
  public static StoredFile parse(String value) {
    if (value == null || !value.startsWith(SCHEME)) {
      return null;
    }
    var rest = value.substring(SCHEME.length());
    int query = rest.indexOf('?');
    var id = decode(query < 0 ? rest : rest.substring(0, query));
    String name = null;
    String type = null;
    String url = null;
    long size = -1;
    if (query >= 0) {
      for (var pair : rest.substring(query + 1).split("&")) {
        int eq = pair.indexOf('=');
        if (eq < 0) {
          continue;
        }
        var text = decode(pair.substring(eq + 1));
        switch (pair.substring(0, eq)) {
          case "name" -> name = text;
          case "type" -> type = text;
          case "url" -> url = text;
          case "size" -> size = parseSize(text);
          default -> {
            // an unknown parameter (a newer writer): ignored
          }
        }
      }
    }
    return new StoredFile(id, name, type, size, url);
  }

  private static long parseSize(String text) {
    try {
      return Long.parseLong(text);
    } catch (NumberFormatException notANumber) {
      return -1;
    }
  }

  /** Percent-encodes UTF-8, keeping only {@code A-Za-z0-9-._~}. */
  static String encode(String text) {
    if (text == null) {
      return "";
    }
    var out = new StringBuilder();
    for (byte b : text.getBytes(StandardCharsets.UTF_8)) {
      int c = b & 0xff;
      if ((c >= 'A' && c <= 'Z')
          || (c >= 'a' && c <= 'z')
          || (c >= '0' && c <= '9')
          || c == '-'
          || c == '.'
          || c == '_'
          || c == '~') {
        out.append((char) c);
      } else {
        out.append('%').append(Character.toUpperCase(Character.forDigit(c >> 4, 16)));
        out.append(Character.toUpperCase(Character.forDigit(c & 0xf, 16)));
      }
    }
    return out.toString();
  }

  /**
   * Decodes {@code %XX} escapes only ({@code +} stays a plus); a malformed escape stays literal.
   */
  static String decode(String text) {
    var bytes = new ByteArrayOutputStream();
    for (int i = 0; i < text.length(); i++) {
      char c = text.charAt(i);
      if (c == '%' && i + 2 < text.length()) {
        int hi = Character.digit(text.charAt(i + 1), 16);
        int lo = Character.digit(text.charAt(i + 2), 16);
        if (hi >= 0 && lo >= 0) {
          bytes.write((hi << 4) | lo);
          i += 2;
          continue;
        }
      }
      var chunk = String.valueOf(c).getBytes(StandardCharsets.UTF_8);
      bytes.write(chunk, 0, chunk.length);
    }
    return bytes.toString(StandardCharsets.UTF_8);
  }
}
