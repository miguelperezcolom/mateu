package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.EmbeddedView;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Guided Process Drawer (Redwood template): a multi-step {@link Wizard} served inside a {@link
 * Drawer} via {@link EmbeddedView}, which embeds the wizard as an INDEPENDENT server-side component
 * so its step navigation routes back to itself (and doesn't bubble to the host).
 */
class GuidedProcessDrawerSyncTest {

  public static class NameStep implements WizardStep {
    public String name = "Ada";
  }

  public static class AgeStep implements WizardStep {
    public int age = 30;
  }

  public static class DoneStep implements WizardStep {
    @PlainText public String message = "pending";
  }

  @UI("/gpd-wizard")
  @Title("Sign up")
  public static class SignupWizard extends Wizard {
    public NameStep nameStep = new NameStep();
    public AgeStep ageStep = new AgeStep();
    public DoneStep done;
  }

  @SuppressWarnings("unused")
  @UI("/gpd-host")
  @Title("Host")
  public static class Host {
    String x = "hi";

    @Action
    Drawer openWizard() {
      return Drawer.builder()
          .id("gpd")
          .headerTitle("Sign up")
          .size(DrawerSize.m)
          .content(new EmbeddedView(new SignupWizard()))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Host.class, SignupWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static <T> java.util.List<T> collect(Object root, Class<T> type) {
    var out = new ArrayList<T>();
    FieldKindsSyncTest.walk(root, type, out);
    return out;
  }

  @Test
  void theWizardIsEmbeddedAsAnIndependentServerSideComponentInsideTheDrawer() {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/gpd-host")
                .actionId("openWizard")
                .serverSideType(Host.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of("x", "hi"))
                .build());
    var root = increment.fragments().get(0).component();

    // the drawer
    DrawerDto drawer = null;
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ClientSideComponentDto c
          && c.metadata() instanceof DrawerDto d) {
        drawer = d;
        break;
      }
    }
    assertThat(drawer).as("drawer fragment").isNotNull();

    // the drawer's content is the wizard embedded as an INDEPENDENT ServerSideComponent, routed to
    // its own type (so its step actions dispatch back to the wizard, not the host)
    assertThat(drawer.content()).isInstanceOf(ServerSideComponentDto.class);
    var embedded = (ServerSideComponentDto) drawer.content();
    assertThat(embedded.serverSideType()).isEqualTo(SignupWizard.class.getName());

    // and it carries its first step's field + the "next" button
    assertThat(collect(embedded, FormFieldDto.class))
        .extracting(FormFieldDto::fieldId)
        .contains("name");
    assertThat(collect(embedded, ButtonDto.class)).extracting(ButtonDto::actionId).contains("next");
  }

  @Test
  void nextAdvancesTheEmbeddedWizardToItsSecondStep() {
    // dispatch "next" against the wizard's own serverSideType (as the embedded component would),
    // carrying the first step's state — it advances to the age step.
    var state = new HashMap<String, Object>();
    state.put("name", "Ada");
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/gpd-wizard")
                .actionId("next")
                .serverSideType(SignupWizard.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(state)
                .build());
    var root = increment.fragments().get(0).component();
    assertThat(collect(root, FormFieldDto.class)).extracting(FormFieldDto::fieldId).contains("age");
  }
}
