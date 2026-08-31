package io.mateu.core.application.openapi;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Generates a Spring Boot module that implements the endpoints an OpenAPI document says this
 * project owes.
 *
 * <p>It generates a CONTROLLER and a PORT, and nothing else. The adapter — the class that actually
 * answers — is written by a human, in a file this generator never produces and therefore can never
 * overwrite. That is the one rule separating a derivation from a one-shot scaffolder:
 *
 * <blockquote>
 *
 * Never mix generated code and hand-written code in the same file.
 *
 * </blockquote>
 *
 * <p>The failure mode it exists to avoid is the generated {@code OrderService} with a {@code //
 * TODO} inside: the second run either destroys the work somebody put there or skips the file
 * forever, and from then on the contract and the code drift in silence. Because every file here is
 * generated, the whole module can be rewritten on every build without risk — which is what makes
 * regenerating cheap enough to actually do.
 *
 * <p>An unimplemented port is therefore not a stub returning empty: it is a missing bean, and the
 * app refuses to start naming which operations have no adapter. A skeleton that started up and
 * answered {@code 200} with nothing would be a worse thing to hand somebody than one that refuses.
 *
 * <p>Only operations marked {@code x-mateu-provenance: generate} are built. Writing a controller
 * for a third party's endpoint would be nonsense, and the source catalogue is what makes that
 * distinction available instead of guessed.
 *
 * <p>Pure by design: it returns file contents and writes nothing, so it is testable without a
 * filesystem and reusable from a Maven goal, a CLI or an endpoint.
 */
public final class ServerSkeleton {

  /** One file to write, at a path relative to the module root. */
  public record GeneratedFile(String path, String content) {}

  /** What the generated module should look like. */
  public record Options(
      String groupId,
      String artifactId,
      String version,
      String basePackage,
      String springBootVersion,
      String javaVersion,
      /**
       * Which operations to build: {@code generate} (the default — only what this project owes),
       * {@code existing}, or {@code all} to ignore the distinction.
       */
      String provenance) {

    public Options {
      groupId = blankTo(groupId, "com.example");
      artifactId = blankTo(artifactId, "api-server");
      version = blankTo(version, "0.0.1-SNAPSHOT");
      basePackage = blankTo(basePackage, groupId + "." + JavaNames.camel(artifactId));
      springBootVersion = blankTo(springBootVersion, "3.3.4");
      javaVersion = blankTo(javaVersion, "21");
      provenance = blankTo(provenance, "generate");
    }

    private static String blankTo(String value, String fallback) {
      return value == null || value.isBlank() ? fallback : value;
    }

    String apiPackage() {
      return basePackage + ".api";
    }

    String modelPackage() {
      return basePackage + ".api.model";
    }
  }

  /** One operation to build. */
  private record Operation(
      String path,
      String httpMethod,
      String group,
      String methodName,
      String summary,
      List<Parameter> parameters,
      JsonNode responseSchema) {

    String key() {
      return group + "#" + methodName;
    }
  }

  private record Parameter(String name, String javaType, boolean required) {}

  /**
   * An operation's return type and the model records that type is made of.
   *
   * <p>Resolved once and shared by the port, the controller and the model files: the return type
   * and the records that make it exist are one decision, and computing them apart is how a
   * generator ends up emitting a signature naming a class it never wrote.
   */
  private record Resolved(String returnType, String rootRecord, Map<String, String> records) {}

  private ServerSkeleton() {}

  /** The whole module. Empty when the document says this project owes nothing. */
  public static List<GeneratedFile> generate(JsonNode openApi, Options options) {
    var operations = operations(openApi, options.provenance());
    if (operations.isEmpty()) {
      return List.of();
    }

    var resolved = new LinkedHashMap<String, Resolved>();
    operations.forEach(operation -> resolved.put(operation.key(), resolve(options, operation)));

    var byGroup = new TreeMap<String, List<Operation>>();
    operations.forEach(
        operation ->
            byGroup.computeIfAbsent(operation.group(), key -> new ArrayList<>()).add(operation));

    var files = new ArrayList<GeneratedFile>();
    files.add(new GeneratedFile("pom.xml", pom(options)));
    files.add(new GeneratedFile(sourcePath(options, "Application.java"), application(options)));
    files.add(
        new GeneratedFile(
            sourcePath(options, "api/MissingApiPortFailureAnalyzer.java"),
            failureAnalyzer(options)));
    files.add(
        new GeneratedFile(
            "src/main/resources/META-INF/spring.factories",
            "org.springframework.boot.diagnostics.FailureAnalyzer=\\\n  "
                + options.apiPackage()
                + ".MissingApiPortFailureAnalyzer\n"));
    byGroup.forEach(
        (group, groupOperations) -> {
          files.add(
              new GeneratedFile(
                  sourcePath(options, "api/" + group + "Api.java"),
                  port(options, group, groupOperations, resolved)));
          files.add(
              new GeneratedFile(
                  sourcePath(options, "api/" + group + "Controller.java"),
                  controller(options, group, groupOperations, resolved)));
        });
    resolved
        .values()
        .forEach(
            entry ->
                entry
                    .records()
                    .forEach(
                        (name, content) -> {
                          if (!content.isBlank()) {
                            files.add(
                                new GeneratedFile(
                                    sourcePath(options, "api/model/" + name + ".java"), content));
                          }
                        }));
    files.add(new GeneratedFile("README.md", readme(options, byGroup, resolved)));
    return files;
  }

  // ── Reading the contract ─────────────────────────────────────────────────────────────────────

  private static List<Operation> operations(JsonNode openApi, String wanted) {
    var operations = new ArrayList<Operation>();
    var paths = openApi == null ? null : openApi.get("paths");
    if (paths == null) {
      return operations;
    }
    var usedNames = new LinkedHashMap<String, Integer>();
    paths
        .fields()
        .forEachRemaining(
            pathEntry ->
                pathEntry
                    .getValue()
                    .fields()
                    .forEachRemaining(
                        methodEntry -> {
                          var operation = methodEntry.getValue();
                          if (!wants(operation, wanted)) {
                            return;
                          }
                          var path = pathEntry.getKey();
                          var group = JavaNames.groupOf(path);
                          var base = methodName(operation, methodEntry.getKey(), path);
                          var seen = usedNames.merge(group + "#" + base, 1, Integer::sum);
                          operations.add(
                              new Operation(
                                  path,
                                  methodEntry.getKey().toUpperCase(),
                                  group,
                                  seen == 1 ? base : base + seen,
                                  text(operation, "summary"),
                                  parameters(operation),
                                  responseSchema(operation)));
                        }));
    return operations;
  }

  /**
   * Whether this operation is one to build. Absent provenance counts as {@code generate}: a
   * document produced by another tool has no opinion about it, and refusing to build anything from
   * such a document would make the generator useless outside Mateu.
   */
  private static boolean wants(JsonNode operation, String wanted) {
    if ("all".equalsIgnoreCase(wanted)) {
      return true;
    }
    var declared = text(operation, OpenApiEmitter.PROVENANCE_EXTENSION);
    return declared.isBlank()
        ? "generate".equalsIgnoreCase(wanted)
        : declared.equalsIgnoreCase(wanted);
  }

  /** The method name: the operationId when there is one, so a named source names its method. */
  private static String methodName(JsonNode operation, String httpMethod, String path) {
    var operationId = text(operation, "operationId");
    if (!operationId.isBlank()) {
      return JavaNames.camel(operationId);
    }
    var tail = new StringBuilder();
    for (var segment : path.split("/")) {
      if (!segment.isBlank() && !segment.startsWith("{")) {
        tail.append(JavaNames.pascal(segment));
      }
    }
    return JavaNames.camel(httpMethod.toLowerCase() + tail);
  }

  private static List<Parameter> parameters(JsonNode operation) {
    var parameters = new ArrayList<Parameter>();
    var declared = operation.get("parameters");
    if (declared == null || !declared.isArray()) {
      return parameters;
    }
    for (var parameter : declared) {
      var name = text(parameter, "name");
      if (!name.isBlank()) {
        parameters.add(
            new Parameter(
                name,
                SchemaToJava.javaType(parameter.get("schema")),
                parameter.hasNonNull("required") && parameter.get("required").asBoolean()));
      }
    }
    return parameters;
  }

  private static JsonNode responseSchema(JsonNode operation) {
    var responses = operation.get("responses");
    var ok = responses == null ? null : responses.get("200");
    var content = ok == null ? null : ok.get("content");
    var json = content == null ? null : content.get("application/json");
    var schema = json == null ? null : json.get("schema");
    return schema != null && schema.isObject() ? schema : null;
  }

  private static Resolved resolve(Options options, Operation operation) {
    var records = new LinkedHashMap<String, String>();
    var rootRecord = JavaNames.pascal(operation.methodName()) + "Response";
    if (operation.responseSchema() == null) {
      // Nothing in the contract describes the body, so nothing is claimed about it.
      return new Resolved("java.util.Map<String, Object>", rootRecord, records);
    }
    var returnType =
        SchemaToJava.returnTypeOf(
            options.modelPackage(), rootRecord, operation.responseSchema(), records);
    return new Resolved(returnType, rootRecord, records);
  }

  // ── Emitting ─────────────────────────────────────────────────────────────────────────────────

  private static String sourcePath(Options options, String relative) {
    return "src/main/java/" + options.basePackage().replace('.', '/') + "/" + relative;
  }

  private static String port(
      Options options, String group, List<Operation> operations, Map<String, Resolved> resolved) {
    var methods = new StringBuilder();
    for (var operation : operations) {
      methods
          .append("\n  /** ")
          .append(
              operation.summary().isBlank()
                  ? operation.httpMethod() + " " + operation.path()
                  : operation.summary())
          .append(" */\n  ")
          .append(returnType(resolved, operation))
          .append(" ")
          .append(operation.methodName())
          .append("(")
          .append(signature(operation))
          .append(");\n");
    }
    return """
        package %s;

        %s/**
         * The operations %s must answer, as the UI's contract states them.
         *
         * <p>GENERATED by Mateu — do not edit; it is rewritten on every build. IMPLEMENT IT in your own
         * class, in a file this generator never writes:
         *
         * <pre>{@code
         * @Service
         * class %sAdapter implements %sApi {
         *   // your queries, your use cases, your business rules
         * }
         * }</pre>
         *
         * <p>Until some bean implements this, the application refuses to start and says which one is
         * missing — deliberately. A generated stub answering 200 with nothing would look like a working
         * server.
         */
        public interface %sApi {
        %s}
        """
        .formatted(
            options.apiPackage(),
            imports(options, resolved, operations),
            group,
            group,
            group,
            group,
            methods);
  }

  private static String controller(
      Options options, String group, List<Operation> operations, Map<String, Resolved> resolved) {
    var methods = new StringBuilder();
    for (var operation : operations) {
      methods
          .append("\n  @")
          .append(mapping(operation.httpMethod()))
          .append("(\"")
          .append(operation.path())
          .append("\")\n  public ")
          .append(returnType(resolved, operation))
          .append(" ")
          .append(operation.methodName())
          .append("(")
          .append(annotatedSignature(operation))
          .append(") {\n    return api.")
          .append(operation.methodName())
          .append("(")
          .append(arguments(operation))
          .append(");\n  }\n");
    }
    return """
        package %s;

        %simport org.springframework.web.bind.annotation.*;

        /**
         * Exposes {@link %sApi} over HTTP exactly as the contract declares it.
         *
         * <p>GENERATED by Mateu — do not edit; it is rewritten on every build. It holds no logic on
         * purpose: all it does is delegate, so regenerating it can never lose work.
         */
        @RestController
        public class %sController {

          private final %sApi api;

          public %sController(%sApi api) {
            this.api = api;
          }
        %s}
        """
        .formatted(
            options.apiPackage(),
            imports(options, resolved, operations),
            group,
            group,
            group,
            group,
            group,
            methods);
  }

  /**
   * The imports the emitted file needs: the model record a return type names, plus whatever the
   * parameter and return types bring with them. Nested records are referenced only from inside the
   * model package, so they need no import here.
   */
  private static String imports(
      Options options, Map<String, Resolved> resolved, List<Operation> operations) {
    var imports = new TreeSet<String>();
    for (var operation : operations) {
      var entry = resolved.get(operation.key());
      if (entry != null) {
        if (entry.returnType().contains(entry.rootRecord())) {
          imports.add(options.modelPackage() + "." + entry.rootRecord());
        }
        addTypeImports(imports, entry.returnType());
      }
      operation.parameters().forEach(parameter -> addTypeImports(imports, parameter.javaType()));
    }
    if (imports.isEmpty()) {
      return "";
    }
    var out = new StringBuilder();
    imports.forEach(name -> out.append("import ").append(name).append(";\n"));
    out.append('\n');
    return out.toString();
  }

  /**
   * Every import a type needs, including the ones NESTED inside it: a {@code
   * java.util.List<java.util.Map<String, Object>>} needs both, and looking only at the outer type
   * emits source that does not compile.
   */
  private static void addTypeImports(TreeSet<String> imports, String javaType) {
    SchemaToJava.importOf(javaType).ifPresent(imports::add);
    if (javaType.contains("java.util.List<")) {
      imports.add("java.util.List");
    }
    if (javaType.contains("java.util.Map<")) {
      imports.add("java.util.Map");
    }
  }

  private static String returnType(Map<String, Resolved> resolved, Operation operation) {
    var entry = resolved.get(operation.key());
    return entry == null ? "Map<String, Object>" : SchemaToJava.simpleName(entry.returnType());
  }

  private static String signature(Operation operation) {
    var out = new StringBuilder();
    for (var parameter : operation.parameters()) {
      if (out.length() > 0) {
        out.append(", ");
      }
      out.append(SchemaToJava.simpleName(parameter.javaType()))
          .append(" ")
          .append(JavaNames.camel(parameter.name()));
    }
    return out.toString();
  }

  private static String annotatedSignature(Operation operation) {
    var out = new StringBuilder();
    for (var parameter : operation.parameters()) {
      if (out.length() > 0) {
        out.append(", ");
      }
      out.append("@RequestParam(name = \"")
          .append(parameter.name())
          .append("\", required = ")
          .append(parameter.required())
          .append(") ")
          .append(SchemaToJava.simpleName(parameter.javaType()))
          .append(" ")
          .append(JavaNames.camel(parameter.name()));
    }
    return out.toString();
  }

  private static String arguments(Operation operation) {
    var out = new StringBuilder();
    for (var parameter : operation.parameters()) {
      if (out.length() > 0) {
        out.append(", ");
      }
      out.append(JavaNames.camel(parameter.name()));
    }
    return out.toString();
  }

  private static String mapping(String httpMethod) {
    return switch (httpMethod) {
      case "POST" -> "PostMapping";
      case "PUT" -> "PutMapping";
      case "PATCH" -> "PatchMapping";
      case "DELETE" -> "DeleteMapping";
      default -> "GetMapping";
    };
  }

  private static String pom(Options options) {
    return """
        <?xml version="1.0" encoding="UTF-8"?>
        <!-- GENERATED by Mateu from the OpenAPI its UI implies. Safe to overwrite: every file in this
             module is generated, and your implementations live in files it never writes. -->
        <project xmlns="http://maven.apache.org/POM/4.0.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
          <modelVersion>4.0.0</modelVersion>

          <parent>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-parent</artifactId>
            <version>%s</version>
            <relativePath/>
          </parent>

          <groupId>%s</groupId>
          <artifactId>%s</artifactId>
          <version>%s</version>

          <properties>
            <java.version>%s</java.version>
          </properties>

          <dependencies>
            <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
          </dependencies>

          <build>
            <plugins>
              <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
              </plugin>
            </plugins>
          </build>
        </project>
        """
        .formatted(
            options.springBootVersion(),
            options.groupId(),
            options.artifactId(),
            options.version(),
            options.javaVersion());
  }

  private static String application(Options options) {
    return """
        package %s;

        import org.springframework.boot.SpringApplication;
        import org.springframework.boot.autoconfigure.SpringBootApplication;

        /** GENERATED by Mateu — do not edit; it is rewritten on every build. */
        @SpringBootApplication
        public class Application {

          public static void main(String[] args) {
            SpringApplication.run(Application.class, args);
          }
        }
        """
        .formatted(options.basePackage());
  }

  private static String failureAnalyzer(Options options) {
    return """
        package %s;

        import org.springframework.beans.factory.NoSuchBeanDefinitionException;
        import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
        import org.springframework.boot.diagnostics.FailureAnalysis;

        /**
         * Turns "no bean of type OrdersApi" into a sentence somebody can act on.
         *
         * <p>An unimplemented operation SHOULD stop the application: this module is a contract, and a
         * server that starts without satisfying it answers requests wrongly instead of visibly. This
         * only makes the refusal legible.
         *
         * <p>GENERATED by Mateu — do not edit; it is rewritten on every build.
         */
        public class MissingApiPortFailureAnalyzer
            extends AbstractFailureAnalyzer<NoSuchBeanDefinitionException> {

          @Override
          protected FailureAnalysis analyze(Throwable failure, NoSuchBeanDefinitionException cause) {
            var missing = cause.getBeanType() == null ? null : cause.getBeanType().getSimpleName();
            if (missing == null || !missing.endsWith("Api")) {
              return null; // not ours; let the default analysis run
            }
            var adapter = missing.substring(0, missing.length() - 3) + "Adapter";
            return new FailureAnalysis(
                "No implementation of "
                    + missing
                    + " was found, so the endpoints it declares cannot be answered.",
                "Write a bean implementing "
                    + missing
                    + " — for example a @Service called "
                    + adapter
                    + ". Put it in a file of your own: this module is regenerated on every build, so"
                    + " anything written inside it would be overwritten.",
                failure);
          }
        }
        """
        .formatted(options.apiPackage());
  }

  private static String readme(
      Options options, Map<String, List<Operation>> byGroup, Map<String, Resolved> resolved) {
    var out = new StringBuilder();
    out.append("# ").append(options.artifactId()).append("\n\n");
    out.append(
        """
        Generated by Mateu from the OpenAPI its UI implies. It contains the endpoints the UI needs and
        this project has to serve — the ones somebody else already serves are deliberately absent.

        **Every file listed below is generated and is rewritten on every build.** Do not edit them:
        write your implementations in files of your own. The generator only ever writes its own files
        and never deletes anything, so a file of yours alongside them survives regeneration — putting
        the adapters in their own package here is fine, and so is putting them in another module.

        That separation is the whole point: it is what makes regenerating safe, and the only reason this
        can be regenerated at all rather than being a one-time scaffold.

        ## What you implement

        One adapter per port. Until each port has a bean, the application refuses to start and names the
        one that is missing.

        """);
    byGroup.forEach(
        (group, operations) -> {
          out.append("### `").append(group).append("Api`\n\n");
          operations.forEach(
              operation ->
                  out.append("- `")
                      .append(returnType(resolved, operation))
                      .append(" ")
                      .append(operation.methodName())
                      .append("(...)` — ")
                      .append(operation.httpMethod())
                      .append(" `")
                      .append(operation.path())
                      .append("`")
                      .append(operation.summary().isBlank() ? "" : " — " + operation.summary())
                      .append("\n"));
          out.append("\n```java\n@Service\nclass ")
              .append(group)
              .append("Adapter implements ")
              .append(group)
              .append("Api {\n  // your queries, your use cases, your business rules\n}\n```\n\n");
        });
    out.append(
        """
        ## What the contract cannot tell you

        It carries paths, methods, parameters and the fields the screens read. It does not carry error
        codes, authentication, idempotency or business rules — those are yours to decide, and no
        derivation can supply them.
        """);
    return out.toString();
  }

  private static String text(JsonNode node, String field) {
    return node != null && node.hasNonNull(field) ? node.get(field).asText() : "";
  }
}
