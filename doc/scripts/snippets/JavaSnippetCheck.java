// Compiles the Java snippets of the docs against the current Mateu API (uidl + core).
//
// Run by doc/scripts/check-snippets.mjs as a single-file source program:
//   java -cp <classpath> JavaSnippetCheck.java <snippets.json> <results.json>
// where <classpath> is what doc/scripts/snippets/pom.xml resolves (mateu-core, mateu-uidl and the
// host-framework types the samples use). Jackson comes with mateu-core.
//
// How a snippet becomes a compilation unit:
//   1. Wrapping. The first of these that PARSES wins: the snippet as a compilation unit (it declares
//      a type), as a class body (fields/methods), as a method body (statements), as an expression.
//   2. Imports. The samples leave their imports out (reference/java-imports.md), so each one is
//      inferred from the names the snippet uses: the Mateu packages, the JDK packages a sample
//      normally imports, and a few host-framework ones. A name in two packages is decided by how it
//      is used (`@Menu` → the annotation, `new Menu(...)` → the record, `implements Listing<R>` →
//      the interface); otherwise JDK first, then uidl data > interfaces > fluent > the rest.
//      A type declared by another snippet of the SAME page is imported from that snippet (the
//      nearest previous one), so a page can declare `Product` once and use it below.
//   3. One javac run compiles every snippet (each in its own package) at --release 21.
//
// What is tolerated, because a sample is a sample and not an application:
//   - types that are not Mateu's and not declared anywhere on the page (`ProductService`) — listed
//     as "assumed" in the report, never when the name is a Mateu-looking one (see MATEU_LOOKING);
//   - free variables/methods of a fragment (a class-body or statement sample using `service`);
//   - `@Override` in a class-body fragment, a missing `return` in a body left as `// ...`, and
//     packages outside io.mateu that do not exist.
// Everything else — an unknown Mateu type, a missing method or attribute on a Mateu type, a wrong
// argument, an abstract method a Mateu base class requires — is a failure.
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.source.tree.*;
import com.sun.source.util.*;
import java.io.*;
import java.lang.reflect.Modifier;
import java.net.*;
import java.nio.file.*;
import java.util.*;
import java.util.jar.*;
import java.util.regex.*;
import java.util.stream.*;
import javax.lang.model.SourceVersion;
import javax.tools.*;

public class JavaSnippetCheck {

  enum Kind { ANNOTATION, INTERFACE, ENUM, RECORD, CLASS }

  record Cand(String fqn, String pkg, Kind kind, int rank) {}

  enum Ctx { ANNOT, IFACE, EXTENDS_CLASS, NEW, BUILDER, TYPE }

  static final List<String> JDK_PACKAGES = List.of(
      "java.util", "java.util.function", "java.util.stream", "java.util.concurrent",
      "java.time", "java.time.format", "java.time.temporal", "java.math", "java.net",
      "java.nio.file", "java.nio.charset", "java.io", "java.lang.annotation", "java.lang.reflect");

  static final List<String> THIRD_PARTY_PACKAGES = List.of(
      "jakarta.validation.constraints", "jakarta.validation", "jakarta.inject",
      "org.springframework.stereotype", "org.springframework.beans.factory.annotation",
      "org.springframework.context.annotation", "org.springframework.boot",
      "org.springframework.boot.autoconfigure", "lombok", "lombok.extern.slf4j", "reactor.core.publisher");

  /** Names a sample may not "assume" as app types: they read as Mateu API, so they must resolve. */
  static final Pattern MATEU_LOOKING = Pattern.compile(
      "^(Mateu.*|Route|Routes|HomeRoute|CrudRepository|CompositionCrudRepository|ListingBackend|"
          + "ReactiveListingBackend|Deleteable|MateuRendererApp)$");

  static final ObjectMapper JSON = new ObjectMapper();
  static final JavaCompiler JAVAC = ToolProvider.getSystemJavaCompiler();

  static Map<String, List<Cand>> index = new HashMap<>();
  static ClassLoader loader;

  public static void main(String[] args) throws Exception {
    @SuppressWarnings("unchecked") List<Map<String, Object>> snippets = JSON.readValue(new File(args[0]), List.class);
    buildIndex();

    Path work = Files.createTempDirectory("mateu-snippets");
    List<Unit> units = new ArrayList<>();
    for (Map<String, Object> s : snippets) {
      units.add(prepare(((Number) s.get("id")).intValue(), (String) s.get("file"),
          (String) s.get("code")));
    }
    resolveImports(units);

    List<File> files = new ArrayList<>();
    Map<String, Unit> byPath = new HashMap<>();
    for (Unit u : units) {
      if (u.mode == null || u.synopsis) continue;
      Path dir = work.resolve("src").resolve(u.pkg.replace('.', '/'));
      Files.createDirectories(dir);
      String name = u.publicTypeName != null ? u.publicTypeName : "Snippet";
      Path f = dir.resolve(name + ".java");
      Files.writeString(f, u.source());
      files.add(f.toFile());
      byPath.put(f.toAbsolutePath().normalize().toString(), u);
    }

    String cp = System.getProperty("java.class.path");
    String lombok = Arrays.stream(cp.split(File.pathSeparator)).filter(p -> p.contains("lombok"))
        .findFirst().orElse(null);
    List<String> options = new ArrayList<>(List.of(
        "--release", "21", "-nowarn", "-Xmaxerrs", "1000000", "-implicit:none",
        // attribute and flow-check EVERY snippet even when another one has an error
        "-XDshould-stop.ifError=FLOW",
        "-encoding", "UTF-8", "-cp", cp, "-d", work.resolve("out").toString()));
    if (lombok != null) options.addAll(List.of("-proc:full", "-processorpath", lombok));
    else options.add("-proc:none");

    DiagnosticCollector<JavaFileObject> diags = new DiagnosticCollector<>();
    try (StandardJavaFileManager fm = JAVAC.getStandardFileManager(diags, Locale.ROOT, null)) {
      JAVAC.getTask(null, fm, diags, options, null, fm.getJavaFileObjectsFromFiles(files)).call();
    }
    for (Diagnostic<? extends JavaFileObject> d : diags.getDiagnostics()) {
      if (System.getenv("MATEU_SNIPPETS_DEBUG") != null) System.err.println(d);
      if (d.getKind() != Diagnostic.Kind.ERROR || d.getSource() == null) continue;
      Unit u = byPath.get(Paths.get(d.getSource().toUri()).toAbsolutePath().normalize().toString());
      if (u == null) continue;
      classify(u, d);
    }

    List<Map<String, Object>> results = new ArrayList<>();
    for (Unit u : units) {
      Map<String, Object> r = new LinkedHashMap<>();
      r.put("id", u.id);
      r.put("mode", u.mode == null ? null : u.mode.name());
      r.put("status", u.mode == null ? "unparseable" : u.errors.isEmpty() ? "pass" : "fail");
      r.put("synopsis", u.synopsis);
      r.put("errors", u.errors);
      r.put("assumed", new TreeSet<>(u.assumed));
      results.add(r);
    }
    JSON.writerWithDefaultPrettyPrinter().writeValue(new File(args[1]), results);
  }

  // ---------------------------------------------------------------------------------------------
  // Index of importable types

  static void buildIndex() throws Exception {
    String cp = System.getProperty("java.class.path");
    List<URL> urls = new ArrayList<>();
    for (String p : cp.split(File.pathSeparator)) urls.add(Paths.get(p).toUri().toURL());
    ClassLoader cl = new URLClassLoader(urls.toArray(URL[]::new), ClassLoader.getPlatformClassLoader());
    loader = cl;

    for (String p : cp.split(File.pathSeparator)) {
      if (!p.endsWith(".jar")) continue;
      boolean mateu = p.contains("/io/mateu/");
      try (JarFile jar = new JarFile(p)) {
        for (JarEntry e : Collections.list(jar.entries())) {
          String n = e.getName();
          if (!n.endsWith(".class") || (n.contains("$") && !mateu) || n.endsWith("module-info.class")
              || n.endsWith("package-info.class")) continue;
          String fqn = n.substring(0, n.length() - 6).replace('/', '.');
          String pkg = fqn.substring(0, Math.max(0, fqn.lastIndexOf('.')));
          if (mateu ? !pkg.startsWith("io.mateu.") : !THIRD_PARTY_PACKAGES.contains(pkg)) continue;
          add(cl, fqn, pkg);
        }
      }
    }
    FileSystem jrt = FileSystems.getFileSystem(URI.create("jrt:/"));
    for (String pkg : JDK_PACKAGES) {
      Path dir = jrt.getPath("modules", "java.base", pkg.replace('.', '/'));
      if (!Files.isDirectory(dir)) continue;
      try (Stream<Path> s = Files.list(dir)) {
        for (Path f : s.toList()) {
          String n = f.getFileName().toString();
          if (n.endsWith(".class") && !n.contains("$"))
            add(ClassLoader.getPlatformClassLoader(), pkg + "." + n.substring(0, n.length() - 6), pkg);
        }
      }
    }
  }

  static void add(ClassLoader cl, String fqn, String pkg) {
    Class<?> c;
    try {
      c = Class.forName(fqn, false, cl);
    } catch (Throwable t) {
      return;
    }
    if (!Modifier.isPublic(c.getModifiers())) return;
    // a public member type (`Step.MarkClean`) is importable by its canonical name, after any
    // top-level type of the same simple name
    boolean nested = c.getEnclosingClass() != null;
    if (nested && (c.getCanonicalName() == null || !Modifier.isPublic(c.getEnclosingClass().getModifiers())
        || !Modifier.isStatic(c.getModifiers()) && !c.isInterface() && !c.isEnum() && !c.isRecord())) return;
    if (nested) fqn = c.getCanonicalName();
    Kind k = c.isAnnotation() ? Kind.ANNOTATION : c.isInterface() ? Kind.INTERFACE
        : c.isEnum() ? Kind.ENUM : c.isRecord() ? Kind.RECORD : Kind.CLASS;
    index.computeIfAbsent(c.getSimpleName(), x -> new ArrayList<>())
        .add(new Cand(fqn, pkg, k, rank(pkg) + (nested ? 10 : 0)));
  }

  static int rank(String pkg) {
    if (pkg.startsWith("java.")) return 0;
    if (pkg.equals("io.mateu.uidl.annotations")) return 1;
    if (pkg.equals("io.mateu.uidl.data")) return 2;
    if (pkg.equals("io.mateu.uidl.interfaces")) return 3;
    if (pkg.equals("io.mateu.uidl.fluent")) return 4;
    if (pkg.startsWith("io.mateu.uidl")) return 5;
    if (!pkg.startsWith("io.mateu.")) return 6;
    if (pkg.startsWith("io.mateu.core.infra.declarative")) return 7;
    return 8;
  }

  /** Where the docs mean the other package than the generic order would pick. */
  static final Map<String, String> PREFERRED = Map.of(
      "Step", "io.mateu.uidl.fluent",
      "Scope", "org.springframework.context.annotation");

  // ---------------------------------------------------------------------------------------------
  // Wrapping

  enum Mode {
    UNIT, BODY, STATEMENTS, EXPRESSION, EXPRESSIONS,
    /** statements whose last one is an expression left without its `;` */
    STATEMENTS_OPEN,
    /** a type's declaration line(s) shown without a body: `public abstract class AutoCrud<T> extends …` */
    HEADER,
    /** nothing but annotations: each one is put on a member it may annotate */
    ANNOTATIONS;

    boolean unitLike() {
      return this == UNIT || this == HEADER;
    }
  }

  static final Pattern IMPORT = Pattern.compile("^\\s*import\\s+(static\\s+)?([\\w.]+)(\\.\\*)?\\s*;\\s*(//.*)?$");
  static final Pattern PACKAGE = Pattern.compile("^\\s*package\\s+[\\w.]+\\s*;\\s*$");
  static final Pattern ELLIPSIS = Pattern.compile("^\\s*(\\.\\.\\.|…)\\s*$");

  static class Unit {
    int id;
    String file;
    String pkg;
    Mode mode;
    String body;            // the snippet, imports blanked out when wrapped
    List<String> ownImports = new ArrayList<>();
    Set<String> importedNames = new HashSet<>();
    Map<String, EnumSet<Ctx>> used = new LinkedHashMap<>();
    Set<String> declared = new HashSet<>();       // every type/type-parameter name it declares
    List<String> topLevel = new ArrayList<>();    // top-level types other snippets may import
    Set<String> plainClasses = new HashSet<>();   // declared classes with no Mateu supertype
    String publicTypeName;
    List<String> addedImports = new ArrayList<>();
    List<Map<String, Object>> errors = new ArrayList<>();
    Set<String> assumed = new HashSet<>();
    String parseError;
    boolean synopsis;
    boolean elided; // the sample says it leaves code out (`{ ... }`, `// …`)
    Set<String> noFit = new HashSet<>(); // known names, but not of the kind the snippet uses

    String header() {
      StringBuilder h = new StringBuilder("package ").append(pkg).append(";");
      for (String i : addedImports) h.append(" import ").append(i).append(";");
      if (!mode.unitLike()) for (String i : ownImports) h.append(" ").append(i);
      switch (mode) {
        case BODY, ANNOTATIONS -> h.append(" class Snippet {");
        case STATEMENTS, STATEMENTS_OPEN -> h.append(" class Snippet { Object __run() throws Throwable {");
        case EXPRESSION -> h.append(" class Snippet { Object __run() throws Throwable { return");
        case EXPRESSIONS -> h.append(" class Snippet { Object[] __run() throws Throwable { return new Object[] {");
        default -> {}
      }
      return h.toString();
    }

    String source() {
      String tail = switch (mode) {
        case BODY, ANNOTATIONS -> "\n}\n";
        case STATEMENTS -> "\n}}\n";
        case STATEMENTS_OPEN -> "\n;}}\n";
        case HEADER -> "\n{}\n";
        case EXPRESSION -> "\n;}}\n";
        case EXPRESSIONS -> "\n};}}\n";
        default -> "\n";
      };
      return header() + "\n" + body + tail;
    }
  }

  static Unit prepare(int id, String file, String code) {
    Unit u = new Unit();
    u.id = id;
    u.file = file;
    u.pkg = "snippets." + file.replaceAll("^src/content/docs/", "").replaceAll("\\.mdx?$", "")
        .replaceAll("[^A-Za-z0-9/]", "_").replace('/', '.').replaceAll("(^|\\.)(\\d)", "$1_$2")
        .toLowerCase() + ".s" + id;
    u.pkg = Arrays.stream(u.pkg.split("\\.")).map(s -> SourceVersion.isKeyword(s) ? s + "_" : s)
        .collect(Collectors.joining("."));

    List<String> lines = new ArrayList<>(Arrays.asList(elide(code).split("\n", -1)));
    List<String> unitLines = new ArrayList<>(), wrappedLines = new ArrayList<>();
    for (String l : lines) {
      if (PACKAGE.matcher(l).matches()) l = "";
      if (ELLIPSIS.matcher(l).matches()) l = "// ...";
      unitLines.add(l);
      Matcher m = IMPORT.matcher(l);
      if (m.matches()) {
        u.ownImports.add(l.trim());
        if (m.group(1) == null && m.group(3) == null)
          u.importedNames.add(m.group(2).substring(m.group(2).lastIndexOf('.') + 1));
        wrappedLines.add("");
      } else {
        wrappedLines.add(l);
      }
    }
    u.elided = !elide(code).equals(code) || code.matches("(?s).*//\\s*(\\.\\.\\.|…).*");
    String unitBody = String.join("\n", unitLines), wrappedBody = String.join("\n", wrappedLines);
    String firstError = null;
    for (Mode mode : Mode.values()) {
      u.mode = mode;
      u.body = switch (mode) {
        case UNIT, HEADER -> unitBody;
        case EXPRESSIONS -> asList(wrappedBody);
        case ANNOTATIONS -> annotated(wrappedBody);
        default -> wrappedBody;
      };
      if (u.body == null) continue;
      ParseResult pr = parse(u.source());
      if (pr.error == null && (!mode.unitLike() || !pr.unit.getTypeDecls().isEmpty())) {
        scan(u, pr.unit);
        checkSynopsis(u, pr);
        return u;
      }
      boolean declaresType = Pattern.compile("(^|\\n)\\s*(public\\s+|abstract\\s+|final\\s+|@\\w+(\\([^)]*\\))?\\s+)*(class|record|interface|enum|@interface)\\s+\\w+").matcher(code).find();
      if (pr.error != null && firstError == null && (mode == Mode.UNIT) == declaresType)
        firstError = pr.error;
      if (firstError == null && mode == Mode.BODY && pr.error != null) firstError = pr.error;
    }
    u.mode = null;
    u.parseError = firstError;
    Map<String, Object> e = new LinkedHashMap<>();
    e.put("line", 0);
    e.put("message", "does not parse as a compilation unit, class body, statements or expression: "
        + firstError);
    u.errors.add(e);
    return u;
  }

  /**
   * Turns the elisions samples use (`{ ... }`, `{ … }`, `foo(...)`) into comments, in code only —
   * never inside strings or comments, and never a varargs `String... args`.
   */
  static String elide(String code) {
    StringBuilder out = new StringBuilder();
    int n = code.length();
    for (int i = 0; i < n; i++) {
      char c = code.charAt(i);
      if (c == '/' && i + 1 < n && code.charAt(i + 1) == '/') {
        int e = code.indexOf('\n', i);
        e = e < 0 ? n : e;
        out.append(code, i, e);
        i = e - 1;
      } else if (c == '/' && i + 1 < n && code.charAt(i + 1) == '*') {
        int e = code.indexOf("*/", i + 2);
        e = e < 0 ? n : e + 2;
        out.append(code, i, e);
        i = e - 1;
      } else if (code.startsWith("\"\"\"", i)) {
        int e = code.indexOf("\"\"\"", i + 3);
        e = e < 0 ? n : e + 3;
        out.append(code, i, e);
        i = e - 1;
      } else if (c == '"' || c == '\'') {
        int j = i + 1;
        while (j < n && code.charAt(j) != c && code.charAt(j) != '\n') j += code.charAt(j) == '\\' ? 2 : 1;
        j = Math.min(j + 1, n);
        out.append(code, i, j);
        i = j - 1;
      } else if (c == '…') {
        out.append("/*…*/");
      } else if (code.startsWith("...", i)) {
        char prev = i == 0 ? ' ' : code.charAt(i - 1);
        if (Character.isJavaIdentifierPart(prev) || prev == '>' || prev == ']') out.append("...");
        else out.append("/*...*/");
        i += 2;
      } else {
        out.append(c);
      }
    }
    return out.toString();
  }

  /**
   * Several expressions one after the other (`Button.builder()…build()` per line, or one per
   * paragraph): a comma goes in front of each line that starts a new one, so they become the items
   * of an array initializer. A line continues the previous expression when it starts with `.`, a
   * closing bracket or an operator, or when the previous line ends with an opening one.
   */
  static String asList(String body) {
    String[] lines = body.split("\n", -1);
    String prev = null;
    for (int i = 0; i < lines.length; i++) {
      String t = lines[i].strip();
      if (t.isEmpty() || t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) continue;
      String code = t.replaceAll("\\s*//.*$", "");
      if (prev != null && !code.matches("^([.)\\]}?:+\\-*/&|,]|->).*")
          && !prev.matches(".*([({\\[,=+\\-*/&|?:]|->)$")) {
        lines[i] = lines[i].replaceFirst("^(\\s*)", "$1, ");
      }
      prev = code;
    }
    return String.join("\n", lines);
  }

  /**
   * A snippet made only of annotations (`@Style(...)`, or several alternatives one per line): each
   * annotation gets a member to sit on, right after it on the same line — a nested class when the
   * annotation may target a type, else a field, else a method. Null when the snippet is anything
   * else.
   */
  static String annotated(String body) {
    StringBuilder out = new StringBuilder();
    int n = body.length(), i = 0, count = 0;
    while (i < n) {
      char c = body.charAt(i);
      if (Character.isWhitespace(c)) { out.append(c); i++; continue; }
      if (body.startsWith("//", i)) {
        int e = body.indexOf('\n', i); e = e < 0 ? n : e;
        out.append(body, i, e); i = e; continue;
      }
      if (body.startsWith("/*", i)) {
        int e = body.indexOf("*/", i + 2); e = e < 0 ? n : e + 2;
        out.append(body, i, e); i = e; continue;
      }
      if (c != '@') return null;
      int j = i + 1;
      while (j < n && (Character.isJavaIdentifierPart(body.charAt(j)) || body.charAt(j) == '.')) j++;
      String name = body.substring(i + 1, j);
      if (name.isEmpty() || name.equals("interface")) return null;
      int k = j;
      while (k < n && body.charAt(k) == ' ') k++;
      if (k < n && body.charAt(k) == '(') {
        int depth = 0;
        boolean str = false;
        for (; k < n; k++) {
          char d = body.charAt(k);
          if (str) { if (d == '\\') k++; else if (d == '"') str = false; continue; }
          if (d == '"') str = true;
          else if (d == '(') depth++;
          else if (d == ')' && --depth == 0) { k++; break; }
        }
        j = k;
      }
      count++;
      out.append(body, i, j).append(' ').append(memberFor(name.substring(name.lastIndexOf('.') + 1), count));
      i = j;
    }
    return count == 0 ? null : out.toString();
  }

  static String memberFor(String annotation, int n) {
    Set<java.lang.annotation.ElementType> targets = EnumSet.allOf(java.lang.annotation.ElementType.class);
    List<Cand> cands = index.getOrDefault(annotation, List.of());
    for (Cand c : cands) {
      if (c.kind() != Kind.ANNOTATION) continue;
      try {
        java.lang.annotation.Target t = Class.forName(c.fqn(), false, loader)
            .getAnnotation(java.lang.annotation.Target.class);
        if (t != null) targets = EnumSet.copyOf(Arrays.asList(t.value()));
      } catch (Throwable ignored) {
      }
      break;
    }
    if (targets.contains(java.lang.annotation.ElementType.TYPE)) return "class __Annotated" + n + " {}";
    if (targets.contains(java.lang.annotation.ElementType.FIELD)) return "Object __annotated" + n + ";";
    return "void __annotated" + n + "() {}";
  }

  /**
   * The real Mateu type a top-level declaration of the snippet is a copy of — the reference pages
   * show `public @interface Section { ... }` or `public record Action(...)` — or null. Same simple
   * name, same kind of declaration.
   */
  static Class<?> synopsisOf(ClassTree c) {
    Kind kind = switch (c.getKind()) {
      case ANNOTATION_TYPE -> Kind.ANNOTATION;
      case INTERFACE -> Kind.INTERFACE;
      case ENUM -> Kind.ENUM;
      case RECORD -> Kind.RECORD;
      default -> Kind.CLASS;
    };
    for (Cand cand : index.getOrDefault(c.getSimpleName().toString(), List.of())) {
      if (cand.pkg().startsWith("io.mateu.") && cand.kind() == kind) {
        try {
          return Class.forName(cand.fqn(), false, loader);
        } catch (Throwable ignored) {
        }
      }
    }
    return null;
  }

  /**
   * A snippet whose every top-level type is a copy of a Mateu type is a SYNOPSIS: it is not compiled
   * (it would only compile the copy), but every attribute, method, record component and enum
   * constant it lists must exist on the real type — a synopsis listing `sticky()` on `@Section` after
   * the attribute was renamed is exactly the drift this check is for.
   */
  static void checkSynopsis(Unit u, ParseResult pr) {
    if (!u.mode.unitLike() || pr.unit.getTypeDecls().isEmpty()) return;
    List<ClassTree> types = new ArrayList<>();
    for (Tree t : pr.unit.getTypeDecls()) {
      if (!(t instanceof ClassTree c) || synopsisOf(c) == null) return;
      types.add(c);
    }
    u.synopsis = true;
    SourcePositions pos = Trees.instance(pr.task).getSourcePositions();
    for (ClassTree c : types) {
      Class<?> real = synopsisOf(c);
      Set<String> names = new HashSet<>();
      for (java.lang.reflect.Method m : real.getMethods()) names.add(m.getName());
      for (java.lang.reflect.Method m : real.getDeclaredMethods()) names.add(m.getName());
      for (java.lang.reflect.Field f : real.getDeclaredFields()) names.add(f.getName());
      for (java.lang.reflect.Field f : real.getFields()) names.add(f.getName());
      for (Tree m : c.getMembers()) {
        String name = m instanceof MethodTree mt ? mt.getName().toString()
            : m instanceof VariableTree vt ? vt.getName().toString() : null;
        if (name == null || name.equals("<init>") || names.contains(name)) continue;
        if (m instanceof MethodTree mt && mt.getName().contentEquals(c.getSimpleName())) continue;
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("line", pr.unit.getLineMap().getLineNumber(pos.getStartPosition(pr.unit, m)) - 1);
        e.put("code", "synopsis");
        e.put("message", real.getName() + " has no member `" + name + "` (the snippet is a copy of it)");
        u.errors.add(e);
      }
    }
  }

  record ParseResult(CompilationUnitTree unit, String error, JavacTask task) {}

  static ParseResult parse(String src) {
    DiagnosticCollector<JavaFileObject> d = new DiagnosticCollector<>();
    JavaFileObject fo = new SimpleJavaFileObject(URI.create("string:///Snippet.java"),
        JavaFileObject.Kind.SOURCE) {
      @Override
      public CharSequence getCharContent(boolean ignore) {
        return src;
      }
    };
    JavacTask task = (JavacTask) JAVAC.getTask(null, null, d, List.of("--release", "21", "-proc:none"),
        null, List.of(fo));
    try {
      Iterator<? extends CompilationUnitTree> it = task.parse().iterator();
      CompilationUnitTree unit = it.next();
      String err = d.getDiagnostics().stream().filter(x -> x.getKind() == Diagnostic.Kind.ERROR)
          .map(x -> "line " + (x.getLineNumber() - 1) + ": " + x.getMessage(Locale.ROOT))
          .findFirst().orElse(null);
      return new ParseResult(unit, err, task);
    } catch (IOException e) {
      return new ParseResult(null, e.toString(), task);
    }
  }

  static void scan(Unit u, CompilationUnitTree cu) {
    for (Tree t : cu.getTypeDecls()) {
      if (t instanceof ClassTree c && u.mode.unitLike()) {
        String name = c.getSimpleName().toString();
        if (synopsisOf(c) == null) u.topLevel.add(name); // a copy of a Mateu type: siblings use the real one
        // ONE public type per file, named after it — a file-name error stops javac before annotation
        // processing, and Lombok would silently not run for any snippet. The first type becomes
        // public (other snippets of the page may use it from their own package); the rest lose a
        // `public` they had. Edited on the same line, so the line numbers still match the page.
        boolean isPublic = c.getModifiers().getFlags().contains(javax.lang.model.element.Modifier.PUBLIC);
        if (u.publicTypeName == null) {
          u.publicTypeName = name;
          if (!isPublic)
            u.body = u.body.replaceFirst("@interface\\s+" + name + "\\b", "public @interface " + name)
                .replaceFirst("(?<!@)\\b(class|record|interface|enum)(\\s+" + name + "\\b)", "public $1$2");
        } else if (isPublic) {
          u.body = u.body.replaceFirst("\\bpublic(\\s+(?:(?:abstract|final|sealed|non-sealed|static|strictfp)\\s+)*"
              + "(?:class|record|interface|enum|@interface)\\s+" + name + "\\b)", "      $1");
        }
      }
    }
    new TreePathScanner<Void, Void>() {
      @Override
      public Void visitClass(ClassTree c, Void v) {
        u.declared.add(c.getSimpleName().toString());
        for (TypeParameterTree tp : c.getTypeParameters()) u.declared.add(tp.getName().toString());
        boolean isInterface = c.getKind() == Tree.Kind.INTERFACE;
        List<Tree> supers = new ArrayList<>(c.getImplementsClause());
        if (c.getExtendsClause() != null) supers.add(c.getExtendsClause());
        boolean mateuSuper = false;
        for (Tree s : supers) {
          String n = rootName(s);
          if (n != null && index.containsKey(n)) mateuSuper = true;
        }
        if (!mateuSuper) u.plainClasses.add(c.getSimpleName().toString());
        if (c.getExtendsClause() != null)
          mark(c.getExtendsClause(), isInterface ? Ctx.IFACE : Ctx.EXTENDS_CLASS);
        for (Tree s : c.getImplementsClause()) mark(s, Ctx.IFACE);
        return super.visitClass(c, v);
      }

      @Override
      public Void visitMethod(MethodTree m, Void v) {
        for (TypeParameterTree tp : m.getTypeParameters()) u.declared.add(tp.getName().toString());
        return super.visitMethod(m, v);
      }

      @Override
      public Void visitAnnotation(AnnotationTree a, Void v) {
        mark(a.getAnnotationType(), Ctx.ANNOT);
        return super.visitAnnotation(a, v);
      }

      @Override
      public Void visitMethodInvocation(MethodInvocationTree mi, Void v) {
        // `Calendar.builder()`: the Mateu record with a Lombok builder, not java.util.Calendar
        if (mi.getMethodSelect() instanceof MemberSelectTree ms && ms.getIdentifier().contentEquals("builder")
            && ms.getExpression() instanceof IdentifierTree id)
          u.used.computeIfAbsent(id.getName().toString(), x -> EnumSet.noneOf(Ctx.class)).add(Ctx.BUILDER);
        return super.visitMethodInvocation(mi, v);
      }

      @Override
      public Void visitNewClass(NewClassTree n, Void v) {
        // `new CrudStore<>() { ... }` instantiates an interface anonymously
        // and in `new Step.MarkClean()` it is the OUTER type that is named, not instantiated
        Tree type = n.getIdentifier() instanceof ParameterizedTypeTree p ? p.getType() : n.getIdentifier();
        mark(n.getIdentifier(), n.getClassBody() != null || type instanceof MemberSelectTree ? Ctx.TYPE : Ctx.NEW);
        return super.visitNewClass(n, v);
      }

      @Override
      public Void visitIdentifier(IdentifierTree id, Void v) {
        String n = id.getName().toString();
        if (!n.isEmpty() && Character.isUpperCase(n.charAt(0)))
          u.used.computeIfAbsent(n, x -> EnumSet.noneOf(Ctx.class)).add(Ctx.TYPE);
        return null;
      }

      void mark(Tree t, Ctx ctx) {
        String n = rootName(t);
        if (n != null) u.used.computeIfAbsent(n, x -> EnumSet.noneOf(Ctx.class)).add(ctx);
      }
    }.scan(cu, null);
  }

  /** The simple name a type tree starts with: `Foo` for Foo, Foo<Bar>, Foo.Inner. */
  static String rootName(Tree t) {
    while (true) {
      if (t instanceof ParameterizedTypeTree p) t = p.getType();
      else if (t instanceof MemberSelectTree m) t = m.getExpression();
      else if (t instanceof AnnotatedTypeTree a) t = a.getUnderlyingType();
      else break;
    }
    return t instanceof IdentifierTree id ? id.getName().toString() : null;
  }

  // ---------------------------------------------------------------------------------------------
  // Import inference

  static void resolveImports(List<Unit> units) {
    Map<String, List<Unit>> pages = units.stream().filter(u -> u.mode != null)
        .collect(Collectors.groupingBy(u -> u.file, LinkedHashMap::new, Collectors.toList()));
    for (List<Unit> page : pages.values()) {
      for (int i = 0; i < page.size(); i++) {
        Unit u = page.get(i);
        for (Map.Entry<String, EnumSet<Ctx>> e : u.used.entrySet()) {
          String name = e.getKey();
          if (u.declared.contains(name) || u.importedNames.contains(name) || isJavaLang(name)) continue;
          Unit sibling = nearestDeclaring(page, i, name);
          if (sibling != null) {
            u.addedImports.add(sibling.pkg + "." + name);
            continue;
          }
          Cand c = choose(name, e.getValue());
          if (c != null) u.addedImports.add(c.fqn());
          else if (index.containsKey(name)) u.noFit.add(name);
        }
      }
    }
  }

  static Unit nearestDeclaring(List<Unit> page, int i, String name) {
    for (int j = i - 1; j >= 0; j--) if (page.get(j).topLevel.contains(name)) return page.get(j);
    for (int j = i + 1; j < page.size(); j++) if (page.get(j).topLevel.contains(name)) return page.get(j);
    return null;
  }

  static Cand choose(String name, EnumSet<Ctx> ctxs) {
    List<Cand> cands = index.get(name);
    if (cands == null) return null;
    Ctx ctx = ctxs.contains(Ctx.ANNOT) ? Ctx.ANNOT : ctxs.contains(Ctx.IFACE) ? Ctx.IFACE
        : ctxs.contains(Ctx.EXTENDS_CLASS) ? Ctx.EXTENDS_CLASS : ctxs.contains(Ctx.BUILDER) ? Ctx.BUILDER
        : ctxs.contains(Ctx.NEW) ? Ctx.NEW : Ctx.TYPE;
    List<Cand> ok = cands.stream().filter(c -> switch (ctx) {
      case ANNOT -> c.kind() == Kind.ANNOTATION;
      case IFACE -> c.kind() == Kind.INTERFACE;
      case EXTENDS_CLASS -> c.kind() == Kind.CLASS;
      case NEW -> c.kind() == Kind.CLASS || c.kind() == Kind.RECORD;
      case BUILDER -> hasBuilder(c);
      case TYPE -> c.kind() != Kind.ANNOTATION;
    }).sorted(Comparator.comparingInt(Cand::rank).thenComparing(Cand::fqn)).toList();
    if (ok.isEmpty()) return null;
    String preferred = PREFERRED.get(name);
    if (preferred != null)
      for (Cand c : ok) if (c.pkg().equals(preferred)) return c;
    return ok.get(0);
  }

  static boolean hasBuilder(Cand c) {
    try {
      Class.forName(c.fqn(), false, loader).getMethod("builder");
      return true;
    } catch (Throwable t) {
      return false;
    }
  }

    static boolean isJavaLang(String name) {
    try {
      Class.forName("java.lang." + name, false, ClassLoader.getPlatformClassLoader());
      return true;
    } catch (Throwable t) {
      return false;
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Classifying compiler errors

  static final Pattern SYMBOL = Pattern.compile("symbol:\\s+(class|variable|method|interface|enum|record|annotation|@interface)\\s+(\\S+)");
  static final Pattern LOCATION = Pattern.compile("location:\\s+(class|interface|enum|record|variable|@interface)\\s+(\\S+)(?:\\s+of type\\s+(\\S+))?");
  static final Pattern MISSING_PACKAGE = Pattern.compile("package ([\\w.]+) does not exist");

  static void classify(Unit u, Diagnostic<? extends JavaFileObject> d) {
    String msg = d.getMessage(Locale.ROOT);
    String code = d.getCode();
    Matcher sym = SYMBOL.matcher(msg), loc = LOCATION.matcher(msg);
    boolean hasSym = sym.find(), hasLoc = loc.find();

    if (code.startsWith("compiler.err.cant.resolve") && hasSym) {
      String kind = sym.group(1), name = sym.group(2).replaceAll("\\(.*", "");
      if (kind.equals("class") || kind.equals("interface")) {
        if ((!index.containsKey(name) || u.noFit.contains(name)) && !MATEU_LOOKING.matcher(name).matches()) {
          u.assumed.add(name);
          return;
        }
      } else if (hasLoc) {
        // javac names a snippet's own types `snippets.<page>.s<n>.Foo` and a library's by their
        // package: only a member missing from a LIBRARY type (Mateu's, the JDK's…) is the API's fault
        String locKind = loc.group(1), locFqn = loc.group(2), locName = simple(locFqn), ofType = loc.group(3);
        boolean ownType = locFqn.startsWith("snippets.");
        if (locKind.equals("variable")) {
          if (ofType == null || ofType.startsWith("snippets.")) return;
        } else if (ownType && locName.equals("Snippet") && !u.mode.unitLike()) {
          return; // free variable / method of a fragment
        } else if (ownType && u.declared.contains(locName)) {
          if (kind.equals("variable")) return; // a field the sample left out
          if (u.plainClasses.contains(locName)) return;
        } else if (ownType) {
          return; // a member of a type another snippet of the page declares
        }
      } else if (kind.equals("variable") || kind.equals("method")) {
        return;
      }
    }
    if (code.equals("compiler.err.doesnt.exist")) {
      Matcher m = MISSING_PACKAGE.matcher(msg);
      if (m.find() && !m.group(1).startsWith("io.mateu")) return;
    }
    if (code.equals("compiler.err.method.does.not.override.superclass") && !u.mode.unitLike()
        && isInWrapper(u, d)) return;
    if (code.equals("compiler.err.missing.ret.stmt")) return;
    if (code.equals("compiler.err.unreachable.stmt")) return; // alternatives shown one after the other
    if (code.startsWith("compiler.err.unreported.exception") && u.elided) return;
    // a member of another snippet of the page, package-private in its own package
    if ((code.equals("compiler.err.not.def.public.cant.access") || code.equals("compiler.err.report.access"))
        && msg.contains(" in snippets.")) return;
    if (code.equals("compiler.err.does.not.override.abstract") && u.elided) return;
    if (code.equals("compiler.err.var.might.not.have.been.initialized")
        || code.equals("compiler.err.var.not.initialized.in.default.constructor")) return;

    Map<String, Object> e = new LinkedHashMap<>();
    e.put("line", d.getLineNumber() - 1); // line 1 of the generated file is the header
    e.put("code", code);
    e.put("message", msg);
    u.errors.add(e);
  }

  static boolean isInWrapper(Unit u, Diagnostic<?> d) {
    return true; // class-body fragments: the method belongs to the synthetic Snippet class
  }

  static String simple(String n) {
    n = n.replaceAll("<.*", "");
    return n.substring(n.lastIndexOf('.') + 1);
  }
}
