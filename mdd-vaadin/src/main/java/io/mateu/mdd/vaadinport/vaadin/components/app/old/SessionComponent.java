package io.mateu.mdd.vaadinport.vaadin.components.app.old;

import com.vaadin.server.ClassResource;
import com.vaadin.ui.Image;
import com.vaadin.ui.VerticalLayout;

public class SessionComponent extends VerticalLayout {

    public SessionComponent() {

        addComponent(new Image("", new ClassResource("/images/profile.jpg")));

    }

}
