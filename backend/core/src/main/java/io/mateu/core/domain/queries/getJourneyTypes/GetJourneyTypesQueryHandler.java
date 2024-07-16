package io.mateu.core.domain.queries.getJourneyTypes;

import io.mateu.core.application.NotFoundException;
import io.mateu.core.domain.UIRegistry;
import io.mateu.core.domain.model.modelToDtoMappers.UIMapper;
import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.remote.dtos.JourneyType;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.UI;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetJourneyTypesQueryHandler {

  final UIRegistry uiRegistry;
  final UIMapper uiMapper;
  final ReflectionHelper reflectionHelper;

  public List<JourneyType> run(GetJourneyTypesQuery query, ServerHttpRequest serverHttpRequest) {

    String uiId = query.getUiId();

    List<JourneyType> journeyTypes = new ArrayList<>();

    try {

      for (Class uiClass : uiRegistry.getUiClasses()) {

        Object uiInstance = reflectionHelper.newInstance(uiClass);

        if (uiInstance == null) {
          throw new Exception();
        }

        UI ui = uiMapper.map(uiInstance, serverHttpRequest);

        if (ui.getMenu() != null) {
          for (Menu menu : ui.getMenu()) {
            addJourneyTypeForMenu(journeyTypes, menu);
          }
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
      log.error("error on getUi", e);
      throw new NotFoundException("No class with name " + uiId + " found");
    }

    return journeyTypes;
  }

  private void addJourneyTypeForMenu(List<JourneyType> journeyTypes, Menu menu) {
    if (menu.getJourneyTypeId() != null) {
      journeyTypes.add(
          JourneyType.builder()
              .id(menu.getJourneyTypeId())
              .name(menu.getCaption())
              .description("This is the journey type for " + menu.getCaption())
              .build());
    } else {
      if (menu.getSubmenus() != null) {
        menu.getSubmenus().forEach(submenu -> addJourneyTypeForMenu(journeyTypes, submenu));
      }
    }
  }
}
