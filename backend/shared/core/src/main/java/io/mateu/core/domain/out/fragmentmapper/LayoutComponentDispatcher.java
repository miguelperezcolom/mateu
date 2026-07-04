package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.mappers.AccordionLayoutMapper.mapAccordionLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AccordionPanelMapper.mapAccordionPanelToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BoardLayoutItemMapper.mapBoardLayoutItemToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BoardLayoutMapper.mapBoardLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BoardLayoutRowMapper.mapBoardLayoutRowToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CarouselLayoutMapper.mapCarouselLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ContainerMapper.mapContainerToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DashboardLayoutMapper.mapDashboardLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DashboardPanelMapper.mapDashboardPanelToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DivMapper.mapDivToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FoldoutLayoutMapper.mapFoldoutLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormItemMapper.mapFormItemToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormLayoutMapper.mapFormLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormRowMapper.mapFormRowToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormSectionMapper.mapFormSectionToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormSubSectionMapper.mapFormSubSectionToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FullWidthMapper.mapFullWidthToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.HeroSectionMapper.mapHeroSectionToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.HorizontalLayoutMapper.mapHorizontalLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MasterDetailLayoutMapper.mapMasterDetailLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ScrollerMapper.mapScrollerToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.SplitLayoutMapper.mapSplitLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TabLayoutMapper.mapTabLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TabMapper.mapTabToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.VerticalLayoutMapper.mapVerticalLayoutToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;

final class LayoutComponentDispatcher {

  static ComponentDto dispatch(
      io.mateu.uidl.fluent.Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof HorizontalLayout horizontalLayout) {
      return mapHorizontalLayoutToDto(
          horizontalLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof VerticalLayout verticalLayout) {
      return mapVerticalLayoutToDto(
          verticalLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormLayout formLayout) {
      return mapFormLayoutToDto(
          formLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormRow formRow) {
      return mapFormRowToDto(
          formRow, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormItem formItem) {
      return mapFormItemToDto(
          formItem, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof SplitLayout splitLayout) {
      return mapSplitLayoutToDto(
          splitLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof MasterDetailLayout masterDetailLayout) {
      return mapMasterDetailLayoutToDto(
          masterDetailLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof CarouselLayout carouselLayout) {
      return mapCarouselLayoutToDto(
          carouselLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof AccordionLayout accordionLayout) {
      return mapAccordionLayoutToDto(
          accordionLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof AccordionPanel accordionPanel) {
      return mapAccordionPanelToDto(
          accordionPanel, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof TabLayout tabLayout) {
      return mapTabLayoutToDto(
          tabLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Tab tab) {
      return mapTabToDto(tab, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof BoardLayout boardLayout) {
      return mapBoardLayoutToDto(
          boardLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof BoardLayoutRow boardLayoutRow) {
      return mapBoardLayoutRowToDto(
          boardLayoutRow, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof BoardLayoutItem boardLayoutItem) {
      return mapBoardLayoutItemToDto(
          boardLayoutItem, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof DashboardLayout dashboardLayout) {
      return mapDashboardLayoutToDto(
          dashboardLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof DashboardPanel dashboardPanel) {
      return mapDashboardPanelToDto(
          dashboardPanel, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FoldoutLayout foldoutLayout) {
      return mapFoldoutLayoutToDto(
          foldoutLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof HeroSection heroSection) {
      return mapHeroSectionToDto(
          heroSection, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Scroller scroller) {
      return mapScrollerToDto(
          scroller, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FullWidth fullWidth) {
      return mapFullWidthToDto(
          fullWidth, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Container container) {
      return mapContainerToDto(
          container, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Div div) {
      return mapDivToDto(div, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormSection formSection) {
      return mapFormSectionToDto(
          formSection, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormSubSection formSubSection) {
      return mapFormSubSectionToDto(
          formSubSection, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    return null;
  }
}
