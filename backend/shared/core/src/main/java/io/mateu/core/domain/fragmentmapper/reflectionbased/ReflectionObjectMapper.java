package io.mateu.core.domain.fragmentmapper.reflectionbased;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public final class ReflectionObjectMapper {

  public static UIFragmentDto mapObjectToFragment(
      Object object, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    var elementDto = new ElementDto("p", Map.of(), object != null ? object.toString() : "-");
    var component =
        new ComponentDto(elementDto, "component_id", object.getClass().getName(), List.of());
    return new UIFragmentDto(initiatorComponentId, component, object);
  }
}
