package io.mateu.remote.domain;

import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MateuApp;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.MenuType;
import io.mateu.remote.dtos.UI;

import java.util.*;
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
                    .flatMap(Collection::stream).map(e -> createMenu(e)).collect(Collectors.toList());
            ui.setMenu(menuOptions);
        }

        return ui;
    }

    private Menu createMenu(MenuEntry menuEntry) {
        if (menuEntry instanceof AbstractMenu) {
            return Menu.builder()
                    .type(MenuType.Submenu)
                    .icon(menuEntry.getIcon() != null?menuEntry.getIcon().toString().toLowerCase(Locale.ROOT):null)
                    .caption(menuEntry.getCaption())
                    .submenus(createSubmenus((AbstractMenu) menuEntry))
                    .build();
        }
        if (menuEntry instanceof AbstractAction) {
            if (menuEntry instanceof MDDOpenEditorAction) {
                MDDOpenEditorAction action = (MDDOpenEditorAction) menuEntry;
                JourneyStoreAccessor.get().putJourneyPerType(menuEntry.getId(), new JourneyMapper().map(action.getBean()), action.getBean());
            } else {
                JourneyStoreAccessor.get().putJourneyPerType(menuEntry.getId(), new JourneyMapper().map(menuEntry), menuEntry);
            }
        }
        return Menu.builder()
                .type(MenuType.MenuOption)
                .icon(menuEntry.getIcon() != null?menuEntry.getIcon().toString().toLowerCase(Locale.ROOT):null)
                .journeyTypeId(menuEntry.getId())
                .caption(menuEntry.getCaption())
                .build();
    }

    private List<Menu> createSubmenus(AbstractMenu m) {
        return m.getEntries().stream().map(e -> createMenu(e)).collect(Collectors.toList());
    }
}
