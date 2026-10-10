package io.mateu.core.application.runaction;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.InvalidTypeIdException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Turns a definition that could not be read into a sentence a developer can act on — the file, the
 * LINE, the key, the value that was wrong and what would be right — and remembers it so a
 * development-mode not-found page can show it.
 *
 * <p>An unparseable definition used to answer "Page not found — it may have been deleted, or the
 * link is wrong" in the browser, and a WARN in the log carrying Jackson's own wording with no line
 * ({@code at [Source: UNKNOWN; byte offset: #UNKNOWN]}): the definition is converted from a parsed
 * tree, so the mapping error has no location of its own. The line is recovered here by walking the
 * YAML text to the key the error names.
 */
public final class YamlSpecProblems {

  private static final YAMLFactory YAML = new YAMLFactory();

  /** The problems of the definitions read so far, by spec path; cleared when specs change. */
  private final Map<String, String> problems =
      java.util.Collections.synchronizedMap(new LinkedHashMap<>());

  /** Which definition each route read, so a route's own problem can be shown first. */
  private final Map<String, String> specOfRoute = new java.util.concurrent.ConcurrentHashMap<>();

  /** Remembers that {@code route} (no leading slash, no query) is served by {@code specPath}. */
  public void routeUses(String route, String specPath) {
    if (route != null && specPath != null && specOfRoute.size() < 4096) {
      specOfRoute.put(route, specPath);
    }
  }

  /**
   * The problems worth showing for {@code route}: its own definition's when it has one, else every
   * recorded problem (the route may be reached through a definition this class never heard of).
   */
  public List<String> forRoute(String route) {
    var spec = route != null ? specOfRoute.get(route) : null;
    var own = spec != null ? problems.get(spec) : null;
    return own != null ? List.of(own) : all();
  }

  /** Remembers the problem of {@code specPath} (replacing any previous one). */
  public void record(String specPath, String problem) {
    problems.put(specPath, problem);
  }

  /** {@code specPath} was read fine: whatever it reported before is no longer true. */
  public void clear(String specPath) {
    problems.remove(specPath);
  }

  /** Every recorded problem, oldest first. */
  public List<String> all() {
    synchronized (problems) {
      return new ArrayList<>(problems.values());
    }
  }

  /** Dev mode: the specs changed, so every problem is re-discovered on the next read. */
  public void reset() {
    problems.clear();
    specOfRoute.clear();
  }

  /**
   * What went wrong reading {@code specPath}, in one paragraph: {@code "specs/ui/form.yaml, line 11
   * (content[0].content[2].dataType): "decimal" is not a valid value — use one of: …"}.
   *
   * @param yamlText the file's text, used to find the line a mapping error points at (may be null)
   */
  public static String describe(String specPath, String yamlText, Throwable error) {
    var where = new StringBuilder(specPath);
    var path = error instanceof JsonMappingException mapping ? pathOf(mapping) : List.<Object>of();
    var line = lineOf(error, yamlText, path);
    if (line > 0) {
      where.append(", line ").append(line);
    }
    if (!path.isEmpty()) {
      where.append(" (").append(dotted(path)).append(")");
    }
    return where
        + ": "
        + whatIsWrong(error)
        + ". The definition is ignored until this is fixed, so its route answers \"Page not"
        + " found\".";
  }

  private static String whatIsWrong(Throwable error) {
    if (error instanceof InvalidFormatException invalid) {
      var target = invalid.getTargetType();
      if (target != null && target.isEnum()) {
        var allowed =
            Arrays.stream(target.getEnumConstants())
                .map(Object::toString)
                .collect(Collectors.joining(", "));
        return "\"" + invalid.getValue() + "\" is not a valid value — use one of: " + allowed;
      }
      return "\""
          + invalid.getValue()
          + "\" is not a valid "
          + (target != null ? target.getSimpleName() : "value");
    }
    if (error instanceof InvalidTypeIdException typeId) {
      var original = typeId.getOriginalMessage();
      var known = original != null ? original.indexOf("known type ids = ") : -1;
      return "unknown type \""
          + typeId.getTypeId()
          + "\""
          + (known >= 0
              ? " — known here: " + original.substring(known + "known type ids = ".length())
              : "")
          + " (type names are case-sensitive)";
    }
    if (error instanceof UnrecognizedPropertyException unknown) {
      var known = unknown.getKnownPropertyIds();
      return "unknown key \""
          + unknown.getPropertyName()
          + "\""
          + (known != null && !known.isEmpty()
              ? " — the keys allowed here are: "
                  + known.stream().map(Object::toString).sorted().collect(Collectors.joining(", "))
              : "");
    }
    if (error instanceof JsonProcessingException processing) {
      var original = processing.getOriginalMessage();
      return original != null ? original.strip() : String.valueOf(error.getMessage());
    }
    return String.valueOf(error.getMessage());
  }

  /** The keys and indexes from the definition's root to what failed. */
  private static List<Object> pathOf(JsonMappingException error) {
    var path = new ArrayList<Object>();
    for (var reference : error.getPath()) {
      if (reference.getFieldName() != null) {
        path.add(reference.getFieldName());
      } else if (reference.getIndex() >= 0) {
        path.add(reference.getIndex());
      }
    }
    return path;
  }

  private static String dotted(List<Object> path) {
    var out = new StringBuilder();
    for (var step : path) {
      if (step instanceof Integer index) {
        out.append('[').append(index).append(']');
      } else {
        if (!out.isEmpty()) {
          out.append('.');
        }
        out.append(step);
      }
    }
    return out.toString();
  }

  /**
   * The 1-based line of the problem: the parser's own location for a syntax error, else the line of
   * the value at {@code path} in the text. The path is matched as a SUFFIX, because the error is
   * relative to the layout and a definition may wrap it in a {@code layout:} envelope.
   */
  static int lineOf(Throwable error, String yamlText, List<Object> path) {
    if (error instanceof JsonProcessingException processing
        && processing.getLocation() != null
        && processing.getLocation().getLineNr() > 0) {
      return processing.getLocation().getLineNr();
    }
    if (yamlText == null || path.isEmpty()) {
      return -1;
    }
    var suffix = new StringBuilder();
    for (var step : path) {
      suffix.append('/').append(step);
    }
    try (JsonParser parser = YAML.createParser(yamlText)) {
      JsonToken token;
      while ((token = parser.nextToken()) != null) {
        if (token == JsonToken.FIELD_NAME) {
          continue;
        }
        var pointer = parser.getParsingContext().pathAsPointer().toString();
        if (token.isStructStart()) {
          // the container itself sits at the parent's pointer
          var parent = parser.getParsingContext().getParent();
          pointer = parent != null ? parent.pathAsPointer().toString() : "";
        }
        if (pointer.endsWith(suffix.toString())) {
          return parser.currentTokenLocation().getLineNr();
        }
      }
    } catch (Exception ignored) {
      // the text did not parse either: the syntax error itself is the problem to report
    }
    return -1;
  }
}
