package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.mapToPageComponent;
import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.CssClasses;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.Header;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.interfaces.Page;
import org.junit.jupiter.api.Test;

class ReflectionPageMapperTest {

  class FakeSimplePage implements Page {}

  @PageTitle("Fake Page")
  @Title("title")
  @Subtitle("subtitle")
  @FavIcon("favicon")
  @Style("style")
  @CssClasses("css")
  class FakeCompletePage implements Page {

    @Avatar String avatar = "avatar";

    @Button
    void button1() {}

    @Button Runnable button2;

    @Toolbar
    void toolbar1() {}

    @Toolbar Runnable toolbar2;

    @Header String header1 = "header1";

    @Footer String footer1 = "footer1";

    String content1 = "content1";
  }

  @Test
  void pageIsReturned() {
    var instance = new FakeSimplePage();
    var page =
        mapToPageComponent(
            instance, "base_url", "route", "initiator_component_id", new FakeHttpRequest());

    assertNotNull(page);
    assertNull(page.pageTitle());
    assertNull(page.subtitle());
    assertNull(page.favicon());
    assertNull(page.cssClasses());
    assertNull(page.style());
    assertNull(page.avatar());
    assertNotNull(page.toolbar());
    assertEquals(0, page.toolbar().size());
    assertNotNull(page.buttons());
    assertEquals(0, page.buttons().size());
    assertNotNull(page.header());
    assertEquals(0, page.header().size());
    assertNotNull(page.content());
    assertEquals(0, page.content().size());
    assertNotNull(page.footer());
    assertEquals(0, page.footer().size());
  }

  @Test
  void pageIsReturnedAndFilled() {
    var instance = new FakeCompletePage();
    var page =
        mapToPageComponent(
            instance, "base_url", "route", "initiator_component_id", new FakeHttpRequest());

    assertNotNull(page);
    assertEquals("Fake Page", page.pageTitle());
    assertEquals("title", page.title());
    assertEquals("favicon", page.favicon());
    assertEquals("subtitle", page.subtitle());
    assertNotNull(page.avatar());
    assertNotNull(page.toolbar());
    assertEquals(2, page.toolbar().size());
    assertNotNull(page.buttons());
    assertEquals(2, page.buttons().size());
    assertNotNull(page.header());
    assertEquals(1, page.header().size());
    assertNotNull(page.content());
    assertEquals(1, page.content().size());
    assertNotNull(page.footer());
    assertEquals(1, page.footer().size());
  }
}
