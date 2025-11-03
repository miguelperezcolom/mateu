package io.mateu.core.domain.out.fragmentmapper.reflectionbased;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class ReflectionObjectMapper {

  public static UIFragmentDto mapObjectToFragment(
      Object object, String baseUrl, String initiatorComponentId, HttpRequest httpRequest) {
    var elementDto =
        new ElementDto("p", Map.of(), Map.of(), object != null ? object.toString() : "-");
    var component =
        new ClientSideComponentDto(
            elementDto, UUID.randomUUID().toString(), List.of(), "", "", null);
    return new UIFragmentDto(
        initiatorComponentId, component, object, null, UIFragmentActionDto.Replace);
  }
}
