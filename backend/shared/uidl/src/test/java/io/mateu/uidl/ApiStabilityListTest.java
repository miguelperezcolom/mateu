package io.mateu.uidl;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Keeps the "Stable and experimental API" lists of the stability page
 * (doc/.../reference/stability-and-versioning.md) generated from the code, so the promise the docs
 * make is exactly what {@code @Experimental} says — the same rule japicmp applies.
 *
 * <p>The page carries a block between {@code <!-- api-stability:start -->} and {@code <!--
 * api-stability:end -->}. This test fails when the block is stale; regenerate it with
 *
 * <pre>
 * mvn -pl shared/uidl test -Dtest=ApiStabilityListTest -Dmateu.api.write=true
 * </pre>
 */
class ApiStabilityListTest {

  private static final Path DOC =
      Path.of("../../../doc/src/content/docs/reference/stability-and-versioning.md");
  private static final String START = "<!-- api-stability:start -->";
  private static final String END = "<!-- api-stability:end -->";

  /** The public Java surface: module name → source root. */
  private static final Map<String, Path> SURFACE =
      Map.of(
          "mateu-uidl", Path.of("src/main/java"),
          "mateu-dtos", Path.of("../dtos/src/main/java"),
          "mateu-core (archetypes)",
              Path.of("../core/src/main/java/io/mateu/core/infra/declarative/orchestrators"));

  private static final Pattern TYPE_DECL =
      Pattern.compile(
          "^public\\s+(?:(?:abstract|final|sealed|non-sealed)\\s+)*"
              + "(@interface|interface|record|enum|class)\\s+(\\w+)",
          Pattern.MULTILINE);
  private static final Pattern EXPERIMENTAL =
      Pattern.compile("@(?:io\\.mateu\\.uidl\\.annotations\\.)?Experimental\\b(\\(\"[^\"]*\"\\))?");
  private static final Pattern INTERNAL =
      Pattern.compile("@(?:io\\.mateu\\.uidl\\.annotations\\.)?Internal\\b(\\(\"[^\"]*\"\\))?");
  private static final Pattern PACKAGE =
      Pattern.compile("^package\\s+([\\w.]+);", Pattern.MULTILINE);

  /**
   * Public only because Java has no module-private: not part of the promise, and excluded from the
   * japicmp check too (keep in sync with the excludes in shared/uidl/pom.xml and core's pom). A
   * type carrying {@code @Internal} is internal as well — prefer the annotation for new ones: the
   * japicmp check excludes it without a pom entry.
   */
  static boolean internal(String pkg, String name) {
    var core = "io.mateu.core.infra.declarative.orchestrators";
    if (pkg.equals(core + ".crud.actionhandlers") || pkg.equals(core + ".crud.routeresolvers")) {
      return true;
    }
    if (pkg.startsWith(core)
        && java.util.Set.of(
                "DashboardComposer",
                "InferredDashboard",
                "WelcomeComposer",
                "InferredWelcome",
                "CapabilityCrud",
                "CrudAdapterHelper",
                "FilterCriteriaBuilder",
                "ListingSummarySpec",
                "SearchableValues")
            .contains(name)) {
      return true;
    }
    return pkg.equals("io.mateu.uidl.reflection")
        || pkg.equals("io.mateu.uidl.layout")
        || (pkg.equals("io.mateu.uidl.interfaces")
            && (name.equals("IconConverter") || name.equals("RoutedClassProvider")));
  }

  record TypeInfo(
      String pkg, String name, boolean experimental, boolean deprecated, boolean marked) {
    boolean isInternal() {
      return marked || internal(pkg, name);
    }
  }

  record Scan(
      List<TypeInfo> types,
      Map<String, TreeSet<String>> experimentalMembers,
      Map<String, TreeSet<String>> internalMembers) {}

  @Test
  void theStabilityPageListsExactlyWhatTheCodeMarks() throws IOException {
    var generated = render();
    var doc = Files.readString(DOC);
    int s = doc.indexOf(START);
    int e = doc.indexOf(END);
    assertThat(s).as("the page carries the generated block").isNotNegative();
    assertThat(e).isGreaterThan(s);
    var current = doc.substring(s + START.length(), e);
    if (Boolean.getBoolean("mateu.api.write")) {
      Files.writeString(DOC, doc.substring(0, s + START.length()) + generated + doc.substring(e));
      return;
    }
    assertThat(current)
        .as(
            "stale API stability list on the stability page — regenerate with"
                + " mvn -pl shared/uidl test -Dtest=ApiStabilityListTest -Dmateu.api.write=true")
        .isEqualTo(generated);
  }

  @Test
  void frameworkPlumbingIsNotFrozenAsStable() throws IOException {
    var internal = new TreeSet<String>();
    var members = new TreeMap<String, TreeSet<String>>();
    for (var root : SURFACE.values()) {
      var scan = scan(root);
      scan.types().stream()
          .filter(TypeInfo::isInternal)
          .forEach(t -> internal.add(t.pkg() + "." + t.name()));
      members.putAll(scan.internalMembers());
    }
    var core = "io.mateu.core.infra.declarative.orchestrators.";
    assertThat(internal)
        .contains(
            core + "crud.CrudActionResult",
            core + "crud.CrudFormState",
            core + "crud.DataLayer",
            core + "importwizard.CsvParser",
            core + "importwizard.ColumnMapping",
            core + "importwizard.RowIssue",
            core + "importwizard.UploadStep",
            core + "importwizard.MappingStep",
            core + "importwizard.ValidationStep",
            core + "importwizard.ImportResultStep",
            core + "masterdetail.NoSelection",
            "io.mateu.uidl.Humanizer",
            "io.mateu.uidl.interfaces.FilterStateAssembler",
            "io.mateu.uidl.interfaces.IdSetFilter",
            "io.mateu.uidl.interfaces.SearchRequestBuilder",
            "io.mateu.uidl.interfaces.GroupActions",
            "io.mateu.uidl.interfaces.MateuInstanceFactory")
        // documented contracts stay stable: the capability tokens, the RouteResolver sentinel and
        // the StaleEditException a store throws
        .doesNotContain(
            "io.mateu.uidl.Capabilities",
            "io.mateu.uidl.RouteConstants",
            core + "crud.OptimisticLock");
    assertThat(members.get("io.mateu.uidl.interfaces.HttpRequest"))
        .contains("storeRunActionRqDto", "storeGetUIRqDto");
    assertThat(members.get("io.mateu.uidl.interfaces.Listing"))
        .contains("handleActionOnRow", "getCrudId");
    assertThat(members.get(core + "wizard.Wizard")).contains("currentStepField");
    // a process-wide test hook is not something an app may call
    assertThat(members.get("io.mateu.uidl.LiveHeaderValues")).contains("reset", "subscribe");
    assertThat(members.get("io.mateu.uidl.di.MateuBeanProvider")).contains("setBeanProvider");
  }

  static String render() throws IOException {
    var out = new StringBuilder("\n");
    out.append(
        "<!-- generated by ApiStabilityListTest from the sources: do not edit by hand -->\n\n");
    out.append(
        "| Module | Package | Public types | Stable | Experimental | Deprecated | Internal |\n");
    out.append("|---|---|---:|---:|---:|---:|---:|\n");
    long[] totals = new long[5];
    var allExperimental = new TreeMap<String, TreeSet<String>>();
    var allMembers = new TreeMap<String, TreeSet<String>>();
    var allInternalMembers = new TreeMap<String, TreeSet<String>>();
    for (var module : new TreeSet<>(SURFACE.keySet())) {
      var scan = scan(SURFACE.get(module));
      var byPkg = new TreeMap<String, List<TypeInfo>>();
      scan.types().forEach(t -> byPkg.computeIfAbsent(t.pkg(), k -> new ArrayList<>()).add(t));
      for (var entry : byPkg.entrySet()) {
        var types = entry.getValue();
        long internal = types.stream().filter(TypeInfo::isInternal).count();
        long exp = types.stream().filter(t -> !t.isInternal() && t.experimental()).count();
        long dep =
            types.stream()
                .filter(t -> !t.isInternal() && !t.experimental() && t.deprecated())
                .count();
        long stable = types.size() - internal - exp - dep;
        totals[0] += types.size();
        totals[1] += stable;
        totals[2] += exp;
        totals[3] += dep;
        totals[4] += internal;
        out.append("| `")
            .append(module)
            .append("` | `")
            .append(entry.getKey())
            .append("` | ")
            .append(types.size())
            .append(" | ")
            .append(stable)
            .append(" | ")
            .append(exp)
            .append(" | ")
            .append(dep)
            .append(" | ")
            .append(internal)
            .append(" |\n");
        types.stream()
            .filter(TypeInfo::experimental)
            .forEach(
                t ->
                    allExperimental
                        .computeIfAbsent(entry.getKey(), k -> new TreeSet<>())
                        .add(t.name()));
      }
      scan.experimentalMembers()
          .forEach((k, v) -> allMembers.computeIfAbsent(k, x -> new TreeSet<>()).addAll(v));
      scan.internalMembers()
          .forEach((k, v) -> allInternalMembers.computeIfAbsent(k, x -> new TreeSet<>()).addAll(v));
    }
    out.append("| **Total** | | **")
        .append(totals[0])
        .append("** | **")
        .append(totals[1])
        .append("** | **")
        .append(totals[2])
        .append("** | **")
        .append(totals[3])
        .append("** | **")
        .append(totals[4])
        .append("** |\n");
    out.append("\n**Experimental types** (the whole type and its members):\n\n");
    for (var entry : allExperimental.entrySet()) {
      out.append("- `").append(entry.getKey()).append("`: ");
      out.append(String.join(", ", entry.getValue().stream().map(n -> "`" + n + "`").toList()));
      out.append("\n");
    }
    out.append("\n**Experimental members** of otherwise stable types:\n\n");
    for (var entry : allMembers.entrySet()) {
      out.append("- `").append(entry.getKey()).append("`: ");
      out.append(String.join(", ", entry.getValue().stream().map(n -> "`" + n + "`").toList()));
      out.append("\n");
    }
    out.append(
        "\n**Internal members** of otherwise stable types (`@Internal`: framework plumbing,"
            + " outside the promise — do not call or override them):\n\n");
    for (var entry : allInternalMembers.entrySet()) {
      out.append("- `").append(entry.getKey()).append("`: ");
      out.append(String.join(", ", entry.getValue().stream().map(n -> "`" + n + "`").toList()));
      out.append("\n");
    }
    return out.append("\n").toString();
  }

  static Scan scan(Path root) throws IOException {
    var types = new ArrayList<TypeInfo>();
    var members = new TreeMap<String, TreeSet<String>>();
    var internalMembers = new TreeMap<String, TreeSet<String>>();
    try (Stream<Path> files = Files.walk(root)) {
      for (Path file : files.filter(p -> p.toString().endsWith(".java")).sorted().toList()) {
        var source = Files.readString(file);
        Matcher decl = TYPE_DECL.matcher(source);
        if (!decl.find()) continue;
        Matcher pkgM = PACKAGE.matcher(source);
        var pkg = pkgM.find() ? pkgM.group(1) : "";
        var head = codeOnly(source.substring(0, decl.start()));
        var typeName = decl.group(2);
        types.add(
            new TypeInfo(
                pkg,
                typeName,
                EXPERIMENTAL.matcher(head).find(),
                head.contains("@Deprecated"),
                INTERNAL.matcher(head).find()));
        // members: every @Experimental after the type declaration
        var body = source.substring(decl.start());
        Matcher m = EXPERIMENTAL.matcher(body);
        while (m.find()) {
          if (inAComment(body, m.start())) continue;
          var member = memberNameAfter(body, m.end());
          if (member != null) {
            members.computeIfAbsent(pkg + "." + typeName, k -> new TreeSet<>()).add(member);
          }
        }
        Matcher im = INTERNAL.matcher(body);
        while (im.find()) {
          if (inAComment(body, im.start())) continue;
          var member = memberNameAfter(body, im.end());
          if (member != null) {
            internalMembers.computeIfAbsent(pkg + "." + typeName, k -> new TreeSet<>()).add(member);
          }
        }
      }
    }
    return new Scan(types, members, internalMembers);
  }

  /** The name of the member an annotation at {@code from} sits on. */
  static String memberNameAfter(String body, int from) {
    var rest = body.substring(from);
    // drop further annotations (with simple string/arg lists) and generics
    rest = rest.replaceFirst("^(\\s*@[\\w.]+(\\([^)]*\\))?)*", "");
    var sb = new StringBuilder();
    int depth = 0;
    for (char c : rest.toCharArray()) {
      if (c == '<') depth++;
      else if (c == '>') depth--;
      else if (depth == 0) {
        if (c == '(' || c == ',' || c == ')' || c == ';' || c == '=' || c == '{') break;
        sb.append(c);
      }
    }
    var words = sb.toString().trim().split("\\s+");
    var name = words[words.length - 1];
    return name.matches("\\w+") ? name : null;
  }

  private static String codeOnly(String s) {
    return s.replaceAll("(?s)/\\*.*?\\*/", "").replaceAll("//[^\\n]*", "");
  }

  private static boolean inAComment(String source, int offset) {
    int lineStart = source.lastIndexOf('\n', offset) + 1;
    var before = source.substring(lineStart, offset).trim();
    return before.startsWith("*")
        || before.startsWith("/*")
        || before.contains("//")
        || before.contains("{@");
  }
}
