package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import io.mateu.uidl.data.NotFound;
import io.mateu.uidl.fluent.Component;
import org.junit.jupiter.api.Test;

/**
 * An unreadable definition used to answer "Page not found" in the browser and log Jackson's wording
 * with no line ({@code [Source: UNKNOWN; byte offset: #UNKNOWN]}). The report now names the file,
 * the line, the key and what would be right.
 */
class YamlSpecProblemsTest {

  private static final String FORM =
      """
      type: Form
      title: Form
      content:
        - type: FormLayout
          content:
            - {type: FormField, id: name, label: Name, dataType: string}
            - {type: FormField, id: birthDate, label: Birth date, dataType: decimal}
      """;

  private final YamlSpecProblems problems = new YamlSpecProblems();

  private static Throwable mappingErrorOf(String yaml) {
    var mapper = YamlUidlMapperFactory.create();
    return catchThrowable(() -> mapper.treeToValue(mapper.readTree(yaml), Component.class));
  }

  @Test
  void anUnknownDataTypeNamesTheLineTheKeyAndTheValidValues() {
    var problem = YamlSpecProblems.describe("specs/ui/form.yaml", FORM, mappingErrorOf(FORM));

    assertThat(problem)
        .startsWith("specs/ui/form.yaml, line 7 (content[0].content[1].dataType)")
        .contains("\"decimal\" is not a valid value — use one of:")
        .contains("number")
        .contains("money")
        .doesNotContain("Source: UNKNOWN");
  }

  @Test
  void theLineIsFoundUnderALayoutEnvelopeToo() {
    var wrapped = "layout:\n" + FORM.indent(2);
    var problem =
        YamlSpecProblems.describe(
            "specs/ui/form.yaml", wrapped, mappingErrorOf(FORM)); // error relative to the layout

    assertThat(problem).contains(", line 8 ");
  }

  @Test
  void anUnknownComponentTypeSaysSoAndListsTheKnownOnes() {
    var yaml =
        """
        type: Listing
        title: Products
        columns:
          - {type: GridColumn, id: id, label: Id}
          - {type: GridColum, id: name, label: Name}
        """;
    var problem = YamlSpecProblems.describe("specs/ui/p.yaml", yaml, mappingErrorOf(yaml));

    assertThat(problem)
        .contains("unknown type \"GridColum\"")
        .contains("GridColumn")
        .contains("case-sensitive");
  }

  @Test
  void aSyntaxErrorKeepsTheParsersOwnLine() {
    var yaml = "type: Form\ncontent:\n  - {type: Text, text: a\n  - {type: Text, text: b}\n";
    var problem = YamlSpecProblems.describe("specs/ui/s.yaml", yaml, mappingErrorOf(yaml));

    assertThat(problem).startsWith("specs/ui/s.yaml, line ").contains("Page not found");
  }

  @Test
  void aDevelopmentModeNotFoundPageListsTheProblems() {
    var page =
        NotFound.builder()
            .id("not-found")
            .title("Page not found")
            .message("It may have been deleted, or the link is wrong.")
            .build();
    assertThat(NotFoundPage.withSpecProblems(page, problems.forRoute("form"))).isEqualTo(page);

    problems.record("specs/ui/form.yaml", "specs/ui/form.yaml, line 7: bad");

    assertThat(NotFoundPage.withSpecProblems(page, problems.forRoute("form")).message())
        .contains("Development mode")
        .contains("specs/ui/form.yaml, line 7: bad");
    assertThat(NotFoundPage.withSpecProblems(page, problems.forRoute("form")).title())
        .isEqualTo("Page not found");
  }

  @Test
  void aRoutesOwnProblemComesAloneWhenItHasOne() {
    problems.record("specs/ui/a.yaml", "problem of a");
    problems.record("specs/ui/b.yaml", "problem of b");
    problems.routeUses("b", "specs/ui/b.yaml");

    assertThat(problems.forRoute("b")).containsExactly("problem of b");
    assertThat(problems.forRoute("elsewhere")).hasSize(2);
  }

  @Test
  void aProblemFixedIsForgotten() {
    problems.record("specs/ui/a.yaml", "a");
    problems.clear("specs/ui/a.yaml");

    assertThat(problems.all()).isEmpty();
  }
}
