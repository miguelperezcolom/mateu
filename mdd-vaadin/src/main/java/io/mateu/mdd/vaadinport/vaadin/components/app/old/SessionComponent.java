package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.google.common.base.Strings;
import com.vaadin.server.ClassResource;
import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Image;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.UserData;

public class SessionComponent extends VerticalLayout {

    private final Image foto;

    public SessionComponent() {

        addStyleName("sesion");

        addComponent(foto = new Image("", new ClassResource("/images/profile.jpg")));
        foto.setVisible(false);
        foto.addStyleName("foto");


    }

    public void update() {
        UserData ud = MDD.getUserData();
        foto.setSource((ud != null && !Strings.isNullOrEmpty(ud.getPhoto()))?new ExternalResource(ud.getPhoto()):new ClassResource("/images/profile.jpg"));
        foto.setVisible(ud != null);
    }
}
