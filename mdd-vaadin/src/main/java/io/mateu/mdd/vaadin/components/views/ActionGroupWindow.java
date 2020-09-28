package io.mateu.mdd.vaadin.components.views;

import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;

import java.lang.reflect.Method;
import java.util.List;

public class ActionGroupWindow extends Window {
    public ActionGroupWindow(Method m, List<Component> o) {
        super("Choose");

        center();
        setClosable(true);
        setModal(true);


        addStyleName("actiongroupwindow");

        CssLayout l;
        setContent(l = new CssLayout());
        if (o != null) o.forEach(c -> l.addComponent(crearBoton(c)));
        else l.addComponent(new Label("No action in this group"));

    }

    private Component crearBoton(Component c) {
        Button b = new Button();
        if (c instanceof Button) {
            Button b0 = (Button) c;
            b.setCaption(b0.getCaption());
            b.setIcon(b0.getIcon());
            b.setVisible(b0.isVisible());
            b.addClickListener(e -> {
                close();
                b0.click();
            });
            b.setStyleName(ValoTheme.BUTTON_QUIET);
        }
        return b;
    }
}
