package io.mateu.uidl.schema;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

/**
 * Reads the FIRST SENTENCE of a UIDL record's class Javadoc from its source file, so the generated
 * schema (and the component catalogue derived from it) describes each component with the words
 * written next to the code — not with a hand-kept list that would drift like the old hand-written
 * schema did.
 *
 * <p>The generator runs from the uidl module's tests, whose working directory is the module, so the
 * sources are at {@code src/main/java}. A record with no Javadoc has no description (and {@code
 * UidlSchemaTest} fails, so a new component cannot ship undescribed).
 */
final class JavadocDescriptions {

  private static final Path SOURCES =
      Path.of(System.getProperty("user.dir")).resolve("src/main/java");

  private JavadocDescriptions() {}

  /** The first sentence of {@code type}'s class Javadoc, or null when it has none. */
  static String of(Class<?> type) {
    var top = type;
    while (top.getEnclosingClass() != null) {
      top = top.getEnclosingClass();
    }
    var file = SOURCES.resolve(top.getName().replace('.', '/') + ".java");
    if (!Files.isRegularFile(file)) {
      return null;
    }
    String source;
    try {
      source = Files.readString(file);
    } catch (IOException e) {
      return null;
    }
    var declaration =
        Pattern.compile(
                "(?m)^[ \\t]*(?:(?:public|protected|private|static|final|sealed|abstract)\\s+)*"
                    + "(?:record|class|interface|enum|@interface)\\s+"
                    + Pattern.quote(type.getSimpleName())
                    + "\\b")
            .matcher(source);
    if (!declaration.find()) {
      return null;
    }
    var before = source.substring(0, declaration.start());
    var end = before.lastIndexOf("*/");
    if (end < 0) {
      return null;
    }
    var gap = before.substring(end + 2);
    // Only annotations and blank lines may sit between the comment and the declaration.
    if (gap.contains(";") || gap.contains("{") || gap.contains("}")) {
      return null;
    }
    var start = before.lastIndexOf("/**", end);
    if (start < 0) {
      return null;
    }
    return firstSentence(before.substring(start + 3, end));
  }

  static String firstSentence(String javadoc) {
    var text = new StringBuilder();
    for (var line : javadoc.split("\n")) {
      var stripped = line.strip();
      if (stripped.startsWith("*")) {
        stripped = stripped.substring(1).strip();
      }
      if (stripped.startsWith("@")) {
        break; // block tags end the description
      }
      if (stripped.isEmpty() || stripped.startsWith("<p>")) {
        if (!text.isEmpty()) {
          break; // the first paragraph only
        }
        if (stripped.isEmpty()) {
          continue;
        }
      }
      text.append(stripped).append(' ');
    }
    var plain =
        text.toString()
            .replaceAll("\\{@link(?:plain)?\\s+[^\\s}]+\\s+([^}]+)}", "$1")
            .replaceAll("\\{@(?:code|link|linkplain|literal)\\s+([^}]*)}", "$1")
            .replace('#', '.')
            .replaceAll("<[^>]+>", "")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
            .replaceAll("\\s+", " ")
            .strip();
    if (plain.isEmpty()) {
      return null;
    }
    // A sentence ends at a period followed by a capital ("e.g. a button" does not end one).
    var stop = Pattern.compile("\\.\\s+(?=[A-Z])").matcher(plain);
    var sentence = stop.find() ? plain.substring(0, stop.start() + 1) : plain;
    return sentence.endsWith(".") ? sentence : sentence + ".";
  }
}
