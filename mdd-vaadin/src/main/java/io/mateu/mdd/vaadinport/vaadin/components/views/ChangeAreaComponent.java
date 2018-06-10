package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinSession;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadinport.vaadin.MyUI;

import java.util.ArrayList;
import java.util.List;

public class ChangeAreaComponent extends AbstractViewComponent {

    private final CssLayout menu = new CssLayout();
    private final AbstractArea area;

    public ChangeAreaComponent(AbstractArea area) {

        this.area = area;

    }

    @Override
    public ChangeAreaComponent build() throws IllegalAccessException, InstantiationException {

        super.build();


        addStyleName("changeareacomponent");


        VerticalLayout l;
        addComponent(l = new VerticalLayout());
        l.addStyleName("listaopcionesmenu");
        l.setWidthUndefined();

        VaadinSession s = VaadinSession.getCurrent();

        boolean autentico = s.getAttribute("usuario") != null;

        List<AbstractArea> areas = new ArrayList<>();

        for (AbstractArea a : MDD.getApp().getAreas()) {
            if (autentico) {
                if (!a.isPublicAccess()) {
                    areas.add(a);
                }
            } else {
                if (!MDD.getApp().isAuthenticationNeeded() || a.isPublicAccess()) {
                    areas.add(a);
                }
            }
        }
        for (AbstractArea a : areas) {


            Component c = null;

            Button b = new Button(a.getName(), new Button.ClickListener() {
                @Override
                public void buttonClick(Button.ClickEvent event) {
                    MyUI ui = (MyUI) UI.getCurrent();
                    ui.goTo(a);
                }
            });

            b.setCaptionAsHtml(true);
            b.setPrimaryStyleName(ValoTheme.BUTTON_LINK);
            b.addStyleName("accionsubmenu");
            //b.setIcon(testIcon.get());  // sin iconos en el menú
            c = b;

            l.addComponent(c);
        }

        return this;
    }

}
