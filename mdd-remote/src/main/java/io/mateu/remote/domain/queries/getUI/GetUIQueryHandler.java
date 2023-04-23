package io.mateu.remote.domain.queries.getUI;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.modelToDtoMappers.UIMapper;
import io.mateu.remote.dtos.UI;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GetUIQueryHandler {

    @Autowired
    UIMapper uiMapper;

    public UI run(GetUIQuery query) {

        String uiId = query.getUiId();

        try {
            Class uiClass = Class.forName(uiId);
            Object uiInstance = ReflectionHelper.newInstance(uiClass);

            if (uiInstance == null) {
                throw new Exception();
            }

            UI ui = uiMapper.map(uiInstance);

            return ui;

        } catch (Exception e) {
            e.printStackTrace();
            log.error("error on getUi", e);
            throw new NotFoundException("No class with name " + uiId + " found");
        }

    }


}
