package io.mateu.remote.domain.queries;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.mappers.UIMapper;
import io.mateu.remote.dtos.UI;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

@Builder
@Slf4j
public class GetUIQuery {

    private final String uiId;

    public GetUIQuery(String uiId) {
        this.uiId = uiId;
    }


    public UI run() {

        try {
            Class uiClass = Class.forName(uiId);
            Object uiInstance = ReflectionHelper.newInstance(uiClass);

            if (uiInstance == null) {
                throw new Exception();
            }

            UI ui = new UIMapper().map(uiInstance);

            return ui;

        } catch (Exception e) {
            e.printStackTrace();
            log.error("error on getUi", e);
            throw new NotFoundException("No class with name " + uiId + " found");
        }

    }

}
