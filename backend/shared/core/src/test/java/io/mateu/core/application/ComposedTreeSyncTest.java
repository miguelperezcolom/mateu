package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.MessageListDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MessageList;
import io.mateu.uidl.data.MessageListItem;
import io.mateu.uidl.data.ModelViewComponent;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A fluent page can be composed from plain objects: {@code VerticalLayout.of(pojo…)} embeds each
 * view model as its OWN server-side component (its type, its fields, its actions — so its buttons
 * route back to it, not to the page), a {@link ModelViewComponent} wraps either a component or a
 * page, and a {@link MessageList} carries its chat items with the author details.
 */
class ComposedTreeSyncTest {

  public static class Note {
    public String text = "remember the milk";

    @Toolbar
    public void archive() {}
  }

  @Title("Notes page")
  public static class NotesPage {
    public String subject = "groceries";
  }

  @UI("/composed-tree")
  public static class ComposedPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(
              List.of(
                  VerticalLayout.of(new Note()),
                  new MessageList(
                      List.of(
                          new MessageListItem("Hi!", "Ada"),
                          new MessageListItem("Hello", "Bob", "10:02", null, "BB", 3))),
                  new ModelViewComponent(new Text("wrapped text")),
                  new ModelViewComponent(new NotesPage())))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ComposedPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aPlainObjectInAVerticalLayoutIsItsOwnServerSideComponent() {
    var increment = mateu.sync("/composed-tree");
    var island =
        WireWalk.all(increment, ServerSideComponentDto.class).stream()
            .filter(s -> Note.class.getName().equals(s.serverSideType()))
            .findFirst()
            .orElseThrow();
    assertThat(WireWalk.all(island, FormFieldDto.class))
        .extracting(FormFieldDto::fieldId)
        .contains("text");
    assertThat(island.actions()).anySatisfy(a -> assertThat(a.id()).isEqualTo("archive"));
  }

  @Test
  void aMessageListCarriesItsItemsAndAuthors() {
    var list = WireWalk.first(mateu.sync("/composed-tree"), MessageListDto.class);
    assertThat(list.items()).hasSize(2);
    var bob = list.items().get(1);
    assertThat(bob.text()).isEqualTo("Hello");
    assertThat(bob.userName()).isEqualTo("Bob");
    assertThat(bob.time()).isEqualTo("10:02");
    assertThat(bob.userAbbr()).isEqualTo("BB");
    assertThat(bob.userColorIndex()).isEqualTo(3);
  }

  @Test
  void aModelViewComponentRendersAComponentOrAPage() {
    var increment = mateu.sync("/composed-tree");
    assertThat(WireWalk.all(increment, TextDto.class))
        .extracting(TextDto::text)
        .contains("wrapped text");
    assertThat(WireWalk.all(increment, FormFieldDto.class))
        .extracting(FormFieldDto::fieldId)
        .contains("subject");
  }
}
