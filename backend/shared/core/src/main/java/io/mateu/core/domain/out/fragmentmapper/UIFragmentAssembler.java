package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.application.runaction.RunActionUseCase.getState;
import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DataMapper.mapDataToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.StateMapper.mapStateToDto;
import static io.mateu.core.infra.declarative.orchestrators.crud.DataLayer.createData;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Optional;

public final class UIFragmentAssembler {

  public static UIFragmentDto mapComponentToFragment(
      ComponentTreeSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof State state) {
      return mapStateToDto(state, initiatorComponentId);
    }
    if (component instanceof Data data) {
      return mapDataToDto(data, initiatorComponentId, componentSupplier);
    }
    if (component != null && component.containerId() != null) {
      initiatorComponentId = component.containerId();
    }
    ComponentDto componentDto =
        mapComponentToDto(
            componentSupplier,
            component,
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest);
    return new UIFragmentDto(
        initiatorComponentId,
        componentDto,
        getState(componentSupplier, httpRequest),
        getData(httpRequest, componentSupplier),
        UIFragmentActionDto.Replace,
        component != null ? component.containerId() : null);
  }

  public static Object getData(HttpRequest httpRequest, Object instance) {
    if (instance instanceof DataSupplier dataSupplier) {
      return dataSupplier.data(httpRequest);
    }
    var data = getData(httpRequest);
    if (data == null && instance != null) {
      return createData(instance, httpRequest);
    }
    return data;
  }

  public static Object getData(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    var data = httpRequest.getAttribute("data");
    if (data instanceof Optional<?>) {
      data = ((Optional<?>) data).orElse(null);
    }
    return data;
  }
}
