package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.BusinessComponent;
import io.mateu.uidl.data.ComponentEntry;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Both halves of the business-component catalogue as a deployment produces them: the
 * {@code @BusinessComponent} members of the classes the annotation processor indexed, and the
 * authored {@code specs/ui/components.yaml} merged on top (authored wins). A broken entry on either
 * side costs only itself.
 */
class ComponentCatalogueSourcesTest {

  @TempDir Path dir;

  /** An indexed view declaring business components in code. */
  public static class IndexedView {
    @BusinessComponent("Greeting")
    Component greeting = new Text("from code");

    @BusinessComponent("Shared")
    static Component shared() {
      return new Text("shared from code");
    }

    @BusinessComponent("WithArgs")
    Component withArgs(String ignored) {
      return new Text("never read: a member needing arguments is not a component");
    }

    @BusinessComponent("")
    Component unnamed = new Text("no name, no entry");
  }

  /** Cannot be instantiated: only its static members can be read. */
  public static class NoDefaultConstructor {
    @BusinessComponent("StaticOnly")
    static Component staticOnly = new Text("static");

    @BusinessComponent("InstanceOnly")
    Component instanceOnly = new Text("instance");

    public NoDefaultConstructor(String required) {}
  }

  private ClassLoader deployment(String components) throws Exception {
    var index = dir.resolve("META-INF/mateu/ui-registrations");
    Files.createDirectories(index.getParent());
    Files.writeString(
        index,
        "class="
            + IndexedView.class.getName()
            + "\npath=/indexed\n---\nclass=com.example.NotOnTheClasspath\npath=/gone\n---\nclass="
            + NoDefaultConstructor.class.getName()
            + "\npath=/static\n");
    if (components != null) {
      var file = dir.resolve("specs/ui/components.yaml");
      Files.createDirectories(file.getParent());
      Files.writeString(file, components);
    }
    return new URLClassLoader(
        new java.net.URL[] {dir.toUri().toURL()}, getClass().getClassLoader());
  }

  private static String text(ComponentEntry entry) {
    return ((Text) entry.component()).text();
  }

  @Test
  void theIndexedClassesContributeTheirBusinessComponents() throws Exception {
    var derived = new ComponentRegistry().derivedFrom(deployment(null));
    assertThat(derived.components())
        .extracting(ComponentEntry::name)
        .containsExactlyInAnyOrder("Greeting", "Shared", "StaticOnly");
    assertThat(text(derived.get("Shared").orElseThrow())).isEqualTo("shared from code");
  }

  @Test
  void theAuthoredFileWinsAndItsBrokenEntriesAreDropped() throws Exception {
    var merged =
        new ComponentRegistry()
            .load(
                deployment(
                    """
                    - name: Greeting
                      component: {type: Text, text: from yaml}
                    - name: Footer
                      component: {type: Text, text: footer}
                    - name: ""
                      component: {type: Text, text: nameless}
                    - name: Empty
                    - name: Broken
                      component: {type: NoSuchComponent}
                    - just a string
                    """));
    assertThat(merged.components())
        .extracting(ComponentEntry::name)
        .containsExactlyInAnyOrder("Greeting", "Footer", "Shared", "StaticOnly");
    assertThat(text(merged.get("Greeting").orElseThrow())).isEqualTo("from yaml");
  }

  @Test
  void aComponentsFileThatIsNotAListContributesNothing() throws Exception {
    var authored =
        new ComponentRegistry().authoredFrom(deployment("components: {Greeting: nope}\n"));
    assertThat(authored.hasNoComponents()).isTrue();
  }
}
