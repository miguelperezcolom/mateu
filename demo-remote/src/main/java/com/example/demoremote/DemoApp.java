package com.example.demoremote;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import io.mateu.remote.domain.UIRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@MateuUI(path = "")
@Component
public class DemoApp implements Runnable {

    @MenuOption(icon = VaadinIcons.AIRPLANE)
    private BasicFieldsForm basicFields;

    @Submenu
    private ExplorerSubmenu explorer;

    @Submenu("Some cruds")
    private CrudsSubmenu cruds;

    @Override
    public void run() {
        System.out.println("Hola");
    }

    @Autowired
    private UIRegistry uiRegistry;

    @PostConstruct
    public void register() {
        uiRegistry.registerUiClass(this.getClass());
    }
}
