package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.data.MetricCard;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.Test;

/**
 * Fase 0 of page-level inference: a plain form that structurally resembles an archetype gets a
 * one-time hint naming it (advice only — the page still renders exactly as before). See
 * design/page-level-inference-plan.md.
 */
class ArchetypeAdvisorTest {

  static class LooksLikeADashboard {
    MetricCard revenue;
    MetricCard occupancy;
    String note;
  }

  static class LooksLikeACollectionDetail {
    record Row(String id, String title) {}

    @OnRowSelected("onPicked")
    List<Row> items;

    Callable<Object> detail;
  }

  static class JustAForm {
    String name;
    String email;
  }

  static class ListWithoutDetailPane {
    record Row(String id) {}

    @OnRowSelected("onPicked")
    List<Row> items;
  }

  @Test
  void metricCardFieldsOnAPlainFormHintTheDashboardArchetype() {
    assertThat(ArchetypeAdvisor.adviceFor(LooksLikeADashboard.class))
        .hasValueSatisfying(advice -> assertThat(advice).contains("Dashboard"));
  }

  @Test
  void selectableListNextToAComponentPaneHintsCollectionDetail() {
    assertThat(ArchetypeAdvisor.adviceFor(LooksLikeACollectionDetail.class))
        .hasValueSatisfying(advice -> assertThat(advice).contains("CollectionDetail"));
  }

  @Test
  void anOrdinaryFormGetsNoAdvice() {
    assertThat(ArchetypeAdvisor.adviceFor(JustAForm.class)).isEmpty();
  }

  @Test
  void aSelectableListAloneIsNotEnoughForTheCollectionDetailHint() {
    assertThat(ArchetypeAdvisor.adviceFor(ListWithoutDetailPane.class)).isEmpty();
  }

  @Test
  void resolvingThePageTypeOfAPlainFormStaysFormWhileAdvising() {
    assertThat(PageTypeResolver.resolve(LooksLikeACollectionDetail.class))
        .isEqualTo(io.mateu.uidl.annotations.PageType.FORM);
    assertThat(PageTypeResolver.resolve(LooksLikeADashboard.class))
        .isEqualTo(io.mateu.uidl.annotations.PageType.DASHBOARD);
  }
}
