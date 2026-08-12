package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.FragmentRegistry;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.core.domain.out.fragmentmapper.FragmentExpander;
import io.mateu.uidl.data.Container;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Fragment;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A fragment is a page-shaped thing with no route: one component, or a list of them, usable
 * anywhere a component is.
 *
 * <p>These pin the two properties that decide whether that sentence is true. First, a fragment that
 * stands for several components <b>splices</b> into its parent rather than wrapping — otherwise
 * "anywhere a component is" quietly excludes forms and grids, the places reuse matters most.
 * Second, fragments are gone by the time anything maps to DTOs, so no renderer has to learn the
 * concept.
 */
class FragmentExpansionTest {

  private final YamlUidlLoader loader = new YamlUidlLoader(new RouteRegistry());

  @BeforeEach
  void clean() {
    FragmentRegistry.instance().reset();
  }

  private static List<Component> contentOf(Component component) {
    return ((FormLayout) component).content();
  }

  @Test
  void aMultiComponentFragmentSplicesIntoItsParentInsteadOfNesting() {
    // THE test. Inside a FormLayout, a wrapper would put two fields in one grid cell. Splicing is
    // what makes a fragment interchangeable with the components it stands for.
    var page = loader.loadSpec("fragment-page").layout();

    var expanded = FragmentExpander.expand(page, null);

    assertThat(contentOf(expanded))
        .extracting(c -> c instanceof FormField f ? f.id() : ((Text) c).text())
        .containsExactly("name", "street", "city", "Prices include VAT.");
  }

  @Test
  void fragmentsAreGoneAfterExpansion() {
    var expanded = FragmentExpander.expand(loader.loadSpec("fragment-page").layout(), null);

    assertThat(contentOf(expanded)).noneMatch(Fragment.class::isInstance);
  }

  @Test
  void aFragmentFileThatIsJustAComponentNeedsNoEnvelope() {
    var expanded = FragmentExpander.expand(new VerticalLayout(new Fragment("legal-notice")), null);

    assertThat(((VerticalLayout) expanded).content())
        .singleElement()
        .isInstanceOf(Text.class)
        .extracting(c -> ((Text) c).text())
        .isEqualTo("Prices include VAT.");
  }

  @Test
  void fragmentsCompose() {
    var expanded = FragmentExpander.expand(new VerticalLayout(new Fragment("contact-card")), null);

    assertThat(((VerticalLayout) expanded).content()).hasSize(3);
  }

  @Test
  void aFragmentCanBeRegisteredInCodeAndWinsOverAFileOfTheSameName() {
    FragmentRegistry.instance()
        .register("legal-notice", List.of(new Text("Registered in code instead.")));

    var expanded = FragmentExpander.expand(new VerticalLayout(new Fragment("legal-notice")), null);

    assertThat(((Text) ((VerticalLayout) expanded).content().get(0)).text())
        .isEqualTo("Registered in code instead.");
  }

  @Test
  void aMissingRefCostsTheFragmentAndNotThePage() {
    // A typo in one ref must not 500 every request to every page that mentions it.
    var expanded =
        FragmentExpander.expand(
            new VerticalLayout(new Text("still here"), new Fragment("no-such-thing")), null);

    assertThat(((VerticalLayout) expanded).content())
        .singleElement()
        .extracting(c -> ((Text) c).text())
        .isEqualTo("still here");
  }

  @Test
  void aFragmentCycleIsReportedRatherThanOverflowingTheStack() {
    var expanded = FragmentExpander.expand(new VerticalLayout(new Fragment("loop-a")), null);

    assertThat(((VerticalLayout) expanded).content()).isEmpty();
  }

  @Test
  void aSingleComponentSlotStacksWhatItCannotSplice() {
    // Container holds exactly one child. Dropping all but the first would be a silent wrong render.
    var expanded = FragmentExpander.expand(new Container(new Fragment("address-block")), null);

    var inner = ((Container) expanded).content();
    assertThat(inner).isInstanceOf(VerticalLayout.class);
    assertThat(((VerticalLayout) inner).content()).hasSize(2);
  }

  @Test
  void aTreeWithoutFragmentsComesBackUntouched() {
    // Identity, not just equality: expansion is on the render path of every page, and the common
    // case must not rebuild the tree.
    var tree =
        new VerticalLayout(
            new Text("hello"),
            new FormLayout(
                null,
                List.of(new Text("nested")),
                false,
                false,
                1,
                null,
                false,
                false,
                null,
                null,
                null,
                null,
                null,
                "",
                ""));

    assertThat(FragmentExpander.expand(tree, null)).isSameAs(tree);
  }
}
