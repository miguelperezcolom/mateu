package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * An Element's {@code on:} map names actions of the view (DOM event → action id). Like any other id
 * a tree references, it is advertised when the view has a handler method for it — before, only
 * {@code actionId}/{@code *ActionId} keys were harvested, so a plain public handler was not
 * advertised and the browser dropped the event ("no component on the page handles it").
 */
class ElementOnActionsSyncTest {

  @UI("/element-on-actions")
  public static class Elements implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          List.<Component>of(
              Element.builder()
                  .name("button")
                  .on(Map.of("click", "elementClicked", "dblclick", "notHandledHere"))
                  .content("click me")
                  .build()));
    }

    public Message elementClicked() {
      return new Message("clicked");
    }
  }

  @Test
  void anElementOnHandlerWithAMethodIsAdvertisedAndAnIdWithoutOneIsNot() {
    try (var mateu = TestMateu.withUis(Elements.class)) {
      var component =
          (ServerSideComponentDto) mateu.sync("/element-on-actions").fragments().get(0).component();
      var ids = component.actions().stream().map(ActionDto::id).toList();
      assertThat(ids).contains("elementClicked");
      // no method for it: it may belong to an enclosing component, so it must bubble
      assertThat(ids).doesNotContain("notHandledHere");
    }
  }
}
