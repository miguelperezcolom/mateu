package io.mateu.remote.domain.queries;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.mappers.UIMapper;
import io.mateu.remote.domain.UIRegistry;
import io.mateu.remote.dtos.JourneyType;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.UI;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Builder
@Slf4j
public class GetJourneyTypesQuery {

    private final String uiId;

    public GetJourneyTypesQuery(String uiId) {
        this.uiId = uiId;
    }


    public List<JourneyType> run() {

        List<JourneyType> journeyTypes = new ArrayList<>();

        try {

            for (Class uiClass : UIRegistry.getUiClasses()) {

                Object uiInstance = ReflectionHelper.newInstance(uiClass);

                if (uiInstance == null) {
                    throw new Exception();
                }

                UI ui = new UIMapper().map(uiInstance);

                for (Menu menu : ui.getMenu()) {
                    addJourneyTypeForMenu(journeyTypes, menu);
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
            journeyTypes.add(JourneyType.builder()
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
