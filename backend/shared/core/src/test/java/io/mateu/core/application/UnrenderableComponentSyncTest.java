package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * What reaches the screen when a view hands back something nothing can render.
 *
 * <p>Real case (the workflow service behind a demo console): a crud's {@code view(id)} answered an
 * unknown id with a {@code Data} — a WIRE FRAGMENT, meant to come back from an action, not from a
 * view. Two separate rules then turned that into Java on a user's screen: the page title falls back
 * to the model's {@code toString()}, and a component no mapper claims is emitted as a div holding
 * its {@code toString()}. The page came out titled — browser tab included — {@code
 * Data[data={error=Process not found}, style=, cssClasses=, newState=null]}.
 *
 * <p>Returning a Data from a view is still a mistake; what this pins is that the mistake is
 * reported to the developer in the log instead of being rendered to whoever pasted the link.
 */
class UnrenderableComponentSyncTest {

  public static class Thing implements Identifiable {
    String id;
    String name;

    public Thing() {}

    public Thing(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  @SuppressWarnings("unused")
  @UI("/things")
  @Title("Things")
  public static class Things extends Crud<Object, Object, Object, Object, Thing, String> {

    @Override
    public ListingData<Thing> search(SearchRequest request, HttpRequest httpRequest) {
      var rows = List.of(new Thing("t1", "One"));
      return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
    }

    @Override
    public Object view(String id, HttpRequest httpRequest) {
      return "t1".equals(id)
          ? new Thing("t1", "One")
          : new Data(Map.of("error", "Thing not found"));
    }

    @Override
    public Object edit(String id, HttpRequest httpRequest) {
      return new Thing("t1", "One");
    }

    @Override
    public Object creationForm(HttpRequest httpRequest) {
      return new Thing();
    }

    @Override
    public String create(HttpRequest httpRequest) {
      return "t1";
    }

    @Override
    public String save(HttpRequest httpRequest) {
      return "t1";
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}
  }

  static TestMateu mateu;

  @BeforeEach
  void boot() {
    mateu = TestMateu.withUis(Things.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
  }

  /** The second hop: the mediator loading the record itself, which is where the view is built. */
  private String viewOf(String id) {
    return mateu
        .run(
            RunActionRqDto.builder()
                .route("/things/" + id)
                .consumedRoute("/things")
                .serverSideType(Things.class.getName())
                .actionId("")
                .build())
        .toString();
  }

  @Test
  void aComponentNothingCanRenderNeverReachesTheScreenAsJava() {
    var increment = viewOf("nope");

    // Neither in the page, nor in the window title command that names the browser tab.
    assertThat(increment).doesNotContain("Data[data=");
    // The title falls back to the type's own name, which says nothing private and reads as a label.
    assertThat(increment).contains("title=Data");
  }

  @Test
  void aViewThatRendersIsUntouched() {
    var increment = viewOf("t1");

    assertThat(increment).doesNotContain("Data[data=");
    // The model's own toString still names the page — the rule this guards is about components.
    assertThat(increment).contains("FormFieldDto");
  }
}
