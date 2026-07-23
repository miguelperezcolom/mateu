package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.mappers.BpmnMapper.mapBpmnToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ChartMapper.mapChartToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DirectoryMapper.mapDirectoryToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormEditorMapper.mapFormEditorToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.GridColumnMapper.mapGridColumnToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.GridGroupColumnMapper.mapGridGroupColumnToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.GridMapper.mapGridToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MapComponentMapper.mapMapToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MenuBarMapper.mapMenuBarToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MicroFrontendMapper.mapMicroFrontendToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.VirtualListMapper.mapVirtualListToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.WorkflowMapper.mapWorkflowToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.HttpRequest;

final class WidgetComponentDispatcher {

  static ComponentDto dispatch(
      io.mateu.uidl.fluent.Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof Bpmn bpmn) {
      return mapBpmnToDto(bpmn);
    }
    if (component instanceof Workflow workflow) {
      return mapWorkflowToDto(workflow);
    }
    if (component instanceof FormEditor formEditor) {
      return mapFormEditorToDto(formEditor);
    }
    if (component instanceof Chart chart) {
      return mapChartToDto(chart);
    }
    if (component instanceof io.mateu.uidl.data.Map map) {
      return mapMapToDto(map);
    }
    if (component instanceof MicroFrontend microFrontend) {
      return mapMicroFrontendToDto(microFrontend);
    }
    if (component instanceof Grid grid) {
      return mapGridToDto(grid, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof GridColumn gridColumn) {
      return mapGridColumnToDto(gridColumn, baseUrl, route, httpRequest);
    }
    if (component instanceof GridGroupColumn gridGroupColumn) {
      return mapGridGroupColumnToDto(gridGroupColumn, baseUrl, route, httpRequest);
    }
    if (component instanceof Directory directory) {
      return mapDirectoryToDto(
          directory, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof VirtualList virtualList) {
      return mapVirtualListToDto(
          virtualList, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof MenuBar menuBar) {
      return mapMenuBarToDto(
          menuBar, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    return null;
  }
}
