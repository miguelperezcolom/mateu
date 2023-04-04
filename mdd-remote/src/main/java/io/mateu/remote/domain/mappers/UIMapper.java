package io.mateu.remote.domain.mappers;

import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.MenuType;
import io.mateu.remote.dtos.UI;
import io.mateu.util.Helper;

import java.util.*;
import java.util.stream.Collectors;

public class UIMapper {
    public UI map(Object uiInstance) throws Exception {
        UI ui = UI.builder()
                .build();

        ui.setTitle(getTitle(uiInstance));
        ui.setSubtitle(getSubtitle(uiInstance));
        if (isForm(uiInstance)) {
            ui.setHomeJourneyTypeId(uiInstance.getClass().getName());
        } else {
            List<Menu> menuOptions = getMenu(uiInstance);
            ui.setMenu(menuOptions);
        }

        return ui;
    }

    private List<Menu> getMenu(Object uiInstance) {
        return new MenuParser(uiInstance).parse().stream().map(e -> createMenu(e)).collect(Collectors.toList());
    }

    private boolean isForm(Object uiInstance) {
        for (FieldInterfaced field : ReflectionHelper.getAllFields(uiInstance.getClass())) {
            if (field.isAnnotationPresent(MenuOption.class) || field.isAnnotationPresent(Submenu.class)) {
                return false;
            }
        }
        return true;
    }

    private String getSubtitle(Object uiInstance) {
        if (uiInstance instanceof HasSubtitle) {
            return ((HasSubtitle) uiInstance).getSubtitle();
        }
        return "";
    }

    private String getTitle(Object uiInstance) {
        if (uiInstance instanceof HasTitle) {
            return ((HasTitle) uiInstance).getTitle();
        }
        return ReflectionHelper.getCaption(uiInstance);
    }

    private Menu createMenu(MenuEntry menuEntry) {
        if (menuEntry instanceof AbstractMenu) {
            return Menu.builder()
                    .type(MenuType.Submenu)
                    .icon(menuEntry.getIcon())
                    .caption(menuEntry.getCaption())
                    .submenus(createSubmenus((AbstractMenu) menuEntry))
                    .build();
        }
        if (menuEntry instanceof AbstractAction) {
            JourneyStoreService.get().storeMenuAction(menuEntry.getId(), menuEntry);
        }
        return Menu.builder()
                .type(MenuType.MenuOption)
                .icon(menuEntry.getIcon())
                .journeyTypeId(menuEntry.getId())
                .caption(menuEntry.getCaption())
                .build();
    }

    private List<Menu> createSubmenus(AbstractMenu m) {
        return m.getEntries().stream().map(e -> createMenu(e)).collect(Collectors.toList());
    }
}
