package io.mateu.mdd.vaadin.components.app.main;

import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.event.FocusShortcut;
import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.shared.annotations.Area;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.MateuUI;

import java.util.ArrayList;
import java.util.List;

public class MenuSearcher extends ComboBox<MenuEntry> {
    public MenuSearcher(AbstractApplication app) {
        addStyleName("menusearcher");
        setPlaceholder("Search in menu");
        updateDataProvider(app);
        setItemCaptionGenerator(i -> i.getCaption());
        addValueChangeListener(e -> {
            if (e.getValue() != null)
                MateuUI.get().getMain().irA(app.getState(e.getValue()));
        });
        setPopupWidth("500px");
        addShortcutListener(new FocusShortcut(this, ShortcutAction.KeyCode.F2));
        addFocusListener(e -> setValue(null));
    }

    public void updateDataProvider(AbstractApplication app) {
        List<MenuEntry> entries = buildOptionsList(app);
        setDataProvider(new ListDataProvider<>(entries));
    }

    private List<MenuEntry> buildOptionsList(AbstractApplication app) {
        setVisible(false);
        List<MenuEntry> entries = new ArrayList<>();
        for (IArea a : app.getAreas()) {
            for (IModule m : a.getModules()) {
                for (MenuEntry e : m.getMenu()) {
                    if (e instanceof AbstractMenu) addOptions(entries, (AbstractMenu) e);
                    else entries.add(e);
                }
            }
        }
        return entries;
    }

    private void addOptions(List<MenuEntry> entries, AbstractMenu m) {
        setVisible(true);
        for (MenuEntry e : m.getEntries()) {
            if (e instanceof AbstractMenu) addOptions(entries, (AbstractMenu) e);
            else entries.add(e);
        }
    }
}
