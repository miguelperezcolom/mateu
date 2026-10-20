package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A view reached through an app's {@code @Menu} field gets its injection points filled like any
 * view Mateu instantiates. The menu path created it with its bare constructor, so a view that
 * builds its content right away (a {@code Dashboard}, any {@link ComponentTreeSupplier}) found its
 * {@code @Autowired}/{@code @Inject} services null; a crud only failed later, if at all, because
 * its rows are fetched by a second request that instantiates it properly.
 */
class MenuViewInjectionSyncTest {

  /** A service the container holds. */
  public static class Counter {
    public String count() {
      return "42 loans";
    }
  }

  public static class Board implements ComponentTreeSupplier {

    @jakarta.inject.Inject Counter counter;

    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text(counter.count());
    }
  }

  @UI("/menu-injection")
  public static class Library {

    @Menu Board board;
  }

  private static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Counter()), Library.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aMenuTargetBuildsItsContentWithTheServiceItDeclared() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/menu-injection/board")
                .consumedRoute("/menu-injection")
                .serverSideType(Library.class.getName())
                .actionId("")
                .build());
    assertThat(increment.messages()).isEmpty();
    assertThat(increment.toString()).contains("42 loans");
  }
}
