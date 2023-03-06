package io.mateu.remote.domain;

import io.mateu.mdd.core.app.MateuApp;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.UI;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UIMapper {
    public UI map(Object uiInstance) throws Exception {
        MateuApp app = new MateuApp(uiInstance);

        UI ui = UI.builder().build();

        if (app.isForm()) {
            ui.setTitle(app.getName());
            ui.setSubtitle("");
            ui.setHomeJourneyTypeId(uiInstance.getClass().getName());
        } else {
            ui.setTitle(app.getName());
            ui.setSubtitle("");
            List<Menu> menuOptions = app.buildAreas().stream().map(a -> Arrays.asList(a.getModules()))
                    .flatMap(Collection::stream).map(m -> m.getMenu())
                    .flatMap(Collection::stream).map(e -> Menu.builder().build()).collect(Collectors.toList());
            ui.setMenu(menuOptions);
        }

        return ui;
    }
}
