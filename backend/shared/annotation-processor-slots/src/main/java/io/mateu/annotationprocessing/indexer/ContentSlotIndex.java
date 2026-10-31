package io.mateu.annotationprocessing.indexer;

import io.mateu.uidl.annotations.ContentSlot;
import io.mateu.uidl.annotations.UI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import javax.annotation.processing.Messager;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic;

/**
 * The {@code @ContentSlot}s of a module: their keys checked at compile time (a key is a contract
 * with the content service, so a malformed or repeated one must not reach it) and written to {@code
 * META-INF/mateu/content-slots.json}, the descriptor the content service loads to list the
 * application's slots in its backoffice (and to mark as orphans the ones that disappear).
 */
final class ContentSlotIndex {

  static final String RESOURCE = "META-INF/mateu/content-slots.json";

  /**
   * {@code application.screen.name} (more segments allowed: the last is the name, the ones between
   * the first and the last the screen): lower case letters and digits, dash-separated words.
   */
  static final Pattern KEY =
      Pattern.compile("[a-z0-9]+(?:-[a-z0-9]+)*(?:\\.[a-z0-9]+(?:-[a-z0-9]+)*){2,}");

  private record Slot(
      String key,
      String declaredIn,
      String field,
      String route,
      String fallback,
      String description,
      int timeoutMs,
      boolean degradeToClient) {}

  private final Map<String, Slot> slots = new LinkedHashMap<>();

  boolean isEmpty() {
    return slots.isEmpty();
  }

  /** Records a slot, or reports why its key cannot be one. */
  void add(Element field, Messager messager) {
    if (field.getKind() != ElementKind.FIELD) {
      // a composed annotation carrying @ContentSlot: its own uses are not seen here
      return;
    }
    var slot = field.getAnnotation(ContentSlot.class);
    var key = slot.key();
    if (!KEY.matcher(key).matches()) {
      messager.printMessage(
          Diagnostic.Kind.ERROR,
          "@ContentSlot key '"
              + key
              + "' is not application.screen.name (lower case letters, digits and dashes,"
              + " dot-separated, at least three segments)",
          field);
      return;
    }
    var owner = (TypeElement) field.getEnclosingElement();
    var declaredIn = owner.getQualifiedName().toString();
    var previous = slots.get(key);
    if (previous != null) {
      messager.printMessage(
          Diagnostic.Kind.ERROR,
          "@ContentSlot key '"
              + key
              + "' is already used by "
              + previous.declaredIn()
              + "."
              + previous.field()
              + ": a key names one slot of the application",
          field);
      return;
    }
    var ui = owner.getAnnotation(UI.class);
    slots.put(
        key,
        new Slot(
            key,
            declaredIn,
            field.getSimpleName().toString(),
            ui != null ? ui.value() : null,
            slot.fallback(),
            slot.description(),
            slot.timeoutMs(),
            slot.degradeToClient()));
  }

  /** The descriptor, as JSON. */
  String toJson(String mateuVersion) {
    var out = new StringBuilder("{\n  \"version\": 1,\n");
    if (mateuVersion != null) {
      out.append("  \"mateuVersion\": ").append(quote(mateuVersion)).append(",\n");
    }
    out.append("  \"slots\": [");
    var first = true;
    for (var slot : slots.values()) {
      var segments = slot.key().split("\\.");
      out.append(first ? "\n" : ",\n");
      first = false;
      out.append("    {")
          .append("\"key\": ")
          .append(quote(slot.key()))
          .append(", \"application\": ")
          .append(quote(segments[0]))
          .append(", \"screen\": ")
          .append(
              quote(
                  String.join(".", java.util.Arrays.copyOfRange(segments, 1, segments.length - 1))))
          .append(", \"name\": ")
          .append(quote(segments[segments.length - 1]))
          .append(", \"declaredIn\": ")
          .append(quote(slot.declaredIn()))
          .append(", \"field\": ")
          .append(quote(slot.field()));
      if (slot.route() != null) {
        out.append(", \"route\": ").append(quote(slot.route()));
      }
      out.append(", \"fallback\": ")
          .append(quote(slot.fallback()))
          .append(", \"description\": ")
          .append(quote(slot.description()))
          .append(", \"timeoutMs\": ")
          .append(slot.timeoutMs())
          .append(", \"degradeToClient\": ")
          .append(slot.degradeToClient())
          .append("}");
    }
    out.append(first ? "]\n}\n" : "\n  ]\n}\n");
    return out.toString();
  }

  static String quote(String value) {
    var out = new StringBuilder("\"");
    for (var c : value.toCharArray()) {
      switch (c) {
        case '"' -> out.append("\\\"");
        case '\\' -> out.append("\\\\");
        case '\n' -> out.append("\\n");
        case '\r' -> out.append("\\r");
        case '\t' -> out.append("\\t");
        default -> {
          if (c < 0x20) out.append(String.format("\\u%04x", (int) c));
          else out.append(c);
        }
      }
    }
    return out.append('"').toString();
  }
}
