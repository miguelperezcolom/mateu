package io.mateu.remote.application;

import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MateuApp;
import io.mateu.remote.dtos.Form;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.UI;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UIMapper {
    public UI map(Object uiInstance) throws Exception {
        MateuApp app = new MateuApp(uiInstance);

        UI ui = new UI();

        if (app.isForm()) {
            ui.setTitle(app.getName());
            ui.setSubtitle("");
            ui.setHome(new ViewMapper().map(uiInstance));
        } else {
            ui.setTitle(app.getName());
            ui.setSubtitle("");
            List<Menu> menuOptions = app.buildAreas().stream().map(a -> Arrays.asList(a.getModules()))
                    .flatMap(Collection::stream).map(m -> m.getMenu())
                    .flatMap(Collection::stream).map(e -> new Menu()).collect(Collectors.toList());
            ui.setMenu(menuOptions);
            ui.setHome(null);
        }

        return ui;
    }
}
