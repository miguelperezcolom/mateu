package io.mateu.mdd.vaadinport.vaadin.components.app.desktop;

import com.google.common.base.Strings;
import com.vaadin.server.ClassResource;
import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Image;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

public class SessionComponent extends VerticalLayout {

    private final Image foto;

    public SessionComponent() {

        addStyleName("sesion");

        addComponent(foto = new Image("", new ClassResource("/images/profile.jpg")));
        setVisible(false);
        foto.addStyleName("foto");
        //foto.setDescription("Click to change your profile");
        foto.addClickListener(e -> MDDUI.get().getNavegador().goTo("private/profile"));


    }

    public void update() {
        UserData ud = MDD.getUserData();
        foto.setSource((ud != null && !Strings.isNullOrEmpty(ud.getPhoto()))?new ExternalResource(ud.getPhoto()):new ClassResource("/images/profile.jpg"));
        setVisible(ud != null);
    }
}
