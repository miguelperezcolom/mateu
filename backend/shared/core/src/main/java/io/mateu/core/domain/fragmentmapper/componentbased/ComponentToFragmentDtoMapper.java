package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AccordionLayoutComponentToDtoMapper.mapAccordionLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AccordionPanelComponentToDtoMapper.mapAccordionPanelToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AppComponentToDtoMapper.mapAppToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AvatarComponentToDtoMapper.mapAvatarToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AvatarGroupComponentToDtoMapper.mapAvatarGroupToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.BadgeComponentToDtoMapper.mapBadgeToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ContainerComponentToDtoMapper.mapContainerToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.CrudlComponentToDtoMapper.mapCrudlToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ElementComponentToDtoMapper.mapElementToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FieldComponentToDtoMapper.mapFieldToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FormComponentToDtoMapper.mapFormToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FormLayoutComponentToDtoMapper.mapFormLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FullWidthComponentToDtoMapper.mapFullWidthToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.HorizontalLayoutComponentToDtoMapper.mapHorizontalLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MasterDetailLayoutComponentToDtoMapper.mapMasterDetailLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ScrollerComponentToDtoMapper.mapScrollerToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.SplitLayoutComponentToDtoMapper.mapSplitLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.TabComponentToDtoMapper.mapTabToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.TabLayoutComponentToDtoMapper.mapTabLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.TextComponentToDtoMapper.mapTextToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.VerticalLayoutComponentToDtoMapper.mapVerticalLayoutToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.AvatarGroup;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Container;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FullWidth;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ComponentSupplier;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public final class ComponentToFragmentDtoMapper {

  public static UIFragmentDto mapComponentToFragment(
      ComponentSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new UIFragmentDto(
        initiatorComponentId,
        mapComponentToDto(componentSupplier, component, baseUrl, route, httpRequest),
        componentSupplier);
  }

  public static ComponentDto mapComponentToDto(
      ComponentSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    if (component instanceof App app) {
      return mapAppToDto(app, componentSupplier, baseUrl, route, httpRequest);
    }
    if (component instanceof Form form) {
      return mapFormToDto(form, componentSupplier, baseUrl, route, httpRequest);
    }
    if (component instanceof Crudl crudl) {
      return mapCrudlToDto(crudl, componentSupplier, baseUrl, route, httpRequest);
    }
    if (component instanceof HorizontalLayout horizontalLayout) {
      return mapHorizontalLayoutToDto(horizontalLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof VerticalLayout verticalLayout) {
      return mapVerticalLayoutToDto(verticalLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof FormLayout formLayout) {
      return mapFormLayoutToDto(formLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof SplitLayout splitLayout) {
      return mapSplitLayoutToDto(splitLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof MasterDetailLayout masterDetailLayout) {
      return mapMasterDetailLayoutToDto(masterDetailLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof AccordionLayout accordionLayout) {
      return mapAccordionLayoutToDto(accordionLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof AccordionPanel accordionPanel) {
      return mapAccordionPanelToDto(accordionPanel, baseUrl, route, httpRequest);
    }
    if (component instanceof TabLayout tabLayout) {
      return mapTabLayoutToDto(tabLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof Tab tab) {
      return mapTabToDto(tab, baseUrl, route, httpRequest);
    }
    if (component instanceof Scroller scroller) {
      return mapScrollerToDto(scroller, baseUrl, route, httpRequest);
    }
    if (component instanceof FullWidth fullWidth) {
      return mapFullWidthToDto(fullWidth, baseUrl, route, httpRequest);
    }
    if (component instanceof Container container) {
      return mapContainerToDto(container, baseUrl, route, httpRequest);
    }
    if (component instanceof Element element) {
      return mapElementToDto(element);
    }
    if (component instanceof Text text) {
      return mapTextToDto(text);
    }
    if (component instanceof Field field) {
      return mapFieldToDto(field);
    }
    if (component instanceof Avatar avatar) {
      return mapAvatarToDto(avatar);
    }
    if (component instanceof AvatarGroup avatarGroup) {
      return mapAvatarGroupToDto(avatarGroup);
    }
    if (component instanceof Badge badge) {
      return mapBadgeToDto(badge);
    }
    return new ComponentDto(
        new ElementDto("div", Map.of(), component.toString()), "fieldId", null, List.of());
  }
}
