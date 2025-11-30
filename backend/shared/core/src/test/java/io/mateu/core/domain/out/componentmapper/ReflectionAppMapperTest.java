package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.annotations.CssClasses;
import io.mateu.uidl.annotations.DrawerClosed;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Widget;
import io.mateu.uidl.interfaces.App;
import org.junit.jupiter.api.Test;

class ReflectionAppMapperTest {

  class FakeSimpleApp implements App {}

  @PageTitle("Fake App")
  @Title("title")
  @Subtitle("subtitle")
  @FavIcon("favicon")
  @Style("style")
  @CssClasses("css")
  @DrawerClosed
  class FakeCompleteApp implements App {

    class Option3Menu {

      @Menu String option4 = "option4";

      @Menu String option5 = "option5";
    }

    @Menu String option1 = "option1";

    @Menu String option2 = "option2";

    @Menu Option3Menu option3;

    @Widget String widget1 = "widget1";
    @Widget String widget2 = "widget2";
  }

  @Test
  void appIsReturned() {
    var instance = new FakeSimpleApp();
    var app =
        mapToAppComponent(
            instance,
            "base_url",
            "route",
            "consumed_route",
            "initiator_component_id",
            new FakeHttpRequest());

    assertNotNull(app);
    assertNull(app.pageTitle());
    assertNull(app.subtitle());
    assertNull(app.favicon());
    assertNotNull(app.menu());
    assertEquals(0, app.menu().size());
    assertNull(app.cssClasses());
    assertNotNull(app.widgets());
    assertEquals(0, app.widgets().size());
    assertNull(app.style());
    assertFalse(app.drawerClosed());
  }

  @Test
  void appIsReturnedAndFilled() {
    var instance = new FakeCompleteApp();
    var app =
        mapToAppComponent(
            instance,
            "base_url",
            "route",
            "consumed_route",
            "initiator_component_id",
            new FakeHttpRequest());

    assertNotNull(app);
    assertEquals("Fake App", app.pageTitle());
    assertEquals("title", app.title());
    assertEquals("favicon", app.favicon());
    assertEquals("subtitle", app.subtitle());
    assertNotNull(app.menu());
    assertEquals(3, app.menu().size());
    assertEquals("Option 1", app.menu().getFirst().label());
    assertEquals("style", app.style());
    assertEquals("css", app.cssClasses());
    assertTrue(app.drawerClosed());
    assertNotNull(app.widgets());
    assertEquals(2, app.widgets().size());
  }
}
