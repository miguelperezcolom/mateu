package io.mateu.remote.domain.mappers;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.shared.interfaces.MenuEntry;
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
        MateuApp app = new MateuApp(uiInstance);

        UI ui = UI.builder()
                .build();

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
                    .icon(getIcon(menuEntry.getIcon()))
                    .caption(menuEntry.getCaption())
                    .submenus(createSubmenus((AbstractMenu) menuEntry))
                    .build();
        }
        if (menuEntry instanceof AbstractAction) {
            JourneyStoreService.get().storeMenuAction(menuEntry.getId(), menuEntry);
        }
        return Menu.builder()
                .type(MenuType.MenuOption)
                .icon(getIcon(menuEntry.getIcon()))
                .journeyTypeId(menuEntry.getId())
                .caption(menuEntry.getCaption())
                .build();
    }

    private String getIcon(VaadinIcons icon) {
        if (icon == null) return null;
        Map<VaadinIcons, String> map = Map.of(
                VaadinIcons.USER, "sap-icon://person-placeholder",
                VaadinIcons.GROUP, "sap-icon://group",
                VaadinIcons.AIRPLANE, "sap-icon://flight"
        );
        return map.get(icon);
    }

    private List<Menu> createSubmenus(AbstractMenu m) {
        return m.getEntries().stream().map(e -> createMenu(e)).collect(Collectors.toList());
    }
}
