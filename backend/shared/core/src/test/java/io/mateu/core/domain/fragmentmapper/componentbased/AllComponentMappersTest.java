package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.MenuBar;
import io.mateu.uidl.interfaces.IconKey;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AllComponentMappersTest {

  private static final String BASE = "base_url";
  private static final String ROUTE = "route";
  private static final String CONSUMED = "consumed";
  private static final String INITIATOR = "initiator";
  private static final FakeHttpRequest HTTP = new FakeHttpRequest();

  private Object map(Component c) {
    return mapComponentToDto(null, c, BASE, ROUTE, CONSUMED, INITIATOR, HTTP);
  }

  @Test void text() { assertThat(map(Text.builder().text("hello").build())).isNotNull(); }
  @Test void textWithStyle() { assertThat(map(Text.builder().text("s").style("color:red").cssClasses("c").build())).isNotNull(); }
  @Test void anchor() { assertThat(map(Anchor.builder().text("click").url("https://x.com").build())).isNotNull(); }
  @Test void icon() { assertThat(map(Icon.builder().icon(IconKey.Abacus).build())).isNotNull(); }
  @Test void div() { assertThat(map(Div.builder().content("c").children(List.of()).build())).isNotNull(); }
  @Test void divWithChildren() { assertThat(map(Div.builder().children(List.of(new Text("child"))).build())).isNotNull(); }
  @Test void button() { assertThat(map(Button.builder().label("click me").actionId("doIt").build())).isNotNull(); }
  @Test void buttonAllFields() {
    assertThat(map(Button.builder().label("b").actionId("a").color(ButtonColor.error)
        .variant(ButtonVariant.danger).buttonStyle(ButtonStyle.primary)
        .size(ButtonSize.small).disabled(true).build())).isNotNull();
  }
  @Test void badge() { assertThat(map(Badge.builder().text("badge").build())).isNotNull(); }
  @Test void badgeWithColor() { assertThat(map(Badge.builder().text("x").color(BadgeColor.contrast).build())).isNotNull(); }
  @Test void avatar() { assertThat(map(Avatar.builder().name("John").build())).isNotNull(); }
  @Test void avatarGroup() { assertThat(map(AvatarGroup.builder().avatars(List.of(Avatar.builder().name("A").build())).build())).isNotNull(); }
  @Test void bpmn() { assertThat(map(Bpmn.builder().xml("<xml/>").build())).isNotNull(); }
  @Test void markdown() { assertThat(map(Markdown.builder().markdown("# Hi").build())).isNotNull(); }
  @Test void progressBar() { assertThat(map(ProgressBar.builder().value(0.5).build())).isNotNull(); }
  @Test void notification() { assertThat(map(Notification.builder().title("info").text("msg").build())).isNotNull(); }
  @Test void kpi() { assertThat(map(new KPI("Revenue", "1M"))).isNotNull(); }
  @Test void horizontalLayout() { assertThat(map(HorizontalLayout.builder().content(List.of(new Text("a"), new Text("b"))).build())).isNotNull(); }
  @Test void verticalLayout() { assertThat(map(VerticalLayout.builder().content(List.of(new Text("a"))).build())).isNotNull(); }
  @Test void formLayout() { assertThat(map(FormLayout.builder().content(List.of(new Text("f"))).build())).isNotNull(); }
  @Test void formRow() { assertThat(map(FormRow.builder().content(List.of(new Text("c"))).build())).isNotNull(); }
  @Test void formItem() { assertThat(map(FormItem.builder().content(List.of(new Text("val"))).build())).isNotNull(); }
  @Test void formSection() { assertThat(map(FormSection.builder().title("S").content(List.of(new Text("x"))).build())).isNotNull(); }
  @Test void formSubSection() { assertThat(map(FormSubSection.builder().title("S").content(List.of(new Text("x"))).build())).isNotNull(); }
  @Test void splitLayout() { assertThat(map(SplitLayout.builder().master(new Text("m")).detail(new Text("d")).build())).isNotNull(); }
  @Test void splitLayoutVariant() {
    assertThat(map(SplitLayout.builder().master(new Text("m")).detail(new Text("d"))
        .variant(SplitLayoutVariant.minimal).orientation(Orientation.horizontal).build())).isNotNull();
  }
  @Test void masterDetailLayout() { assertThat(map(MasterDetailLayout.builder().master(new Text("m")).detail(new Text("d")).build())).isNotNull(); }
  @Test void carouselLayout() { assertThat(map(CarouselLayout.builder().content(List.of(new Text("s"))).build())).isNotNull(); }
  @Test void accordionLayout() {
    assertThat(map(AccordionLayout.builder()
        .panels(List.of(AccordionPanel.builder().label("P1").content(new Text("c")).build()))
        .build())).isNotNull();
  }
  @Test void accordionLayoutVariant() { assertThat(map(AccordionLayout.builder().panels(List.of()).variant(AccordionLayoutVariant.filled).build())).isNotNull(); }
  @Test void accordionPanel() { assertThat(map(AccordionPanel.builder().label("P").content(new Text("b")).build())).isNotNull(); }
  @Test void tabLayout() { assertThat(map(TabLayout.builder().tabs(List.of(new Tab("Tab 1", new Text("c")))).build())).isNotNull(); }
  @Test void tabLayoutVariant() { assertThat(map(TabLayout.builder().tabs(List.of(new Tab("T", new Text("c")))).variant(TabLayoutVariant.centered).build())).isNotNull(); }
  @Test void boardLayout() {
    assertThat(map(BoardLayout.builder().rows(List.of(BoardLayoutRow.builder()
        .content(List.of(new Text("i"))).build())).build())).isNotNull();
  }
  @Test void boardLayoutRow() { assertThat(map(BoardLayoutRow.builder().content(List.of()).build())).isNotNull(); }
  @Test void boardLayoutItem() { assertThat(map(new BoardLayoutItem(new Text("c"), 1))).isNotNull(); }
  @Test void scroller() { assertThat(map(Scroller.builder().content(new Text("s")).build())).isNotNull(); }
  @Test void fullWidth() { assertThat(map(new FullWidth(new Text("f")))).isNotNull(); }
  @Test void container() { assertThat(map(new Container(new Text("i")))).isNotNull(); }
  @Test void breadcrumbs() { assertThat(map(Breadcrumbs.builder().breadcrumbs(List.of(new Breadcrumb("Home", "/"))).build())).isNotNull(); }
  @Test void confirmDialog() { assertThat(map(ConfirmDialog.builder().header("Confirm").build())).isNotNull(); }
  @Test void contextMenu() { assertThat(map(ContextMenu.builder().wrapped(new Text("i")).build())).isNotNull(); }
  @Test void cookieConsent() { assertThat(map(CookieConsent.builder().message("Cookies").build())).isNotNull(); }
  @Test void cookieConsentWithPosition() { assertThat(map(CookieConsent.builder().message("C").position(CookieConsentPosition.Top).build())).isNotNull(); }
  @Test void details() { assertThat(map(Details.builder().summary(new Text("S")).content(new Text("d")).build())).isNotNull(); }
  @Test void dialog() { assertThat(map(Dialog.builder().headerTitle("D").content(new Text("b")).build())).isNotNull(); }
  @Test void image() { assertThat(map(new Image("https://example.com/img.png"))).isNotNull(); }
  @Test void mapComponent() { assertThat(map(io.mateu.uidl.data.Map.builder().build())).isNotNull(); }
  @Test void microFrontend() { assertThat(map(MicroFrontend.builder().route("r").baseUrl("http://localhost").build())).isNotNull(); }
  @Test void popover() { assertThat(map(Popover.builder().content(new Text("p")).wrapped(new Text("t")).build())).isNotNull(); }
  @Test void tooltip() { assertThat(map(Tooltip.builder().text("tip").wrapped(new Text("t")).build())).isNotNull(); }
  @Test void messageInput() { assertThat(map(MessageInput.builder().build())).isNotNull(); }
  @Test void messageList() { assertThat(map(MessageList.builder().build())).isNotNull(); }
  @Test void customField() { assertThat(map(CustomField.builder().label("lbl").content(new Text("c")).build())).isNotNull(); }
  @Test void menuBar() { assertThat(map(MenuBar.builder().build())).isNotNull(); }
  @Test void virtualList() {
    var page = Page.<Component>builder().content(List.of(new Text("item"))).build();
    assertThat(map(VirtualList.builder().page(page).build())).isNotNull();
  }
  @Test void state() {
    mapComponentToDto(null, new State(Map.of("key", "value")), BASE, ROUTE, CONSUMED, INITIATOR, HTTP);
  }
}
