package io.mateu.mdd.vaadinport.vaadin.mdd;

import com.vaadin.ui.Notification;
import com.vaadin.ui.UI;
import io.mateu.mdd.core.MDDPort;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.views.RPCView;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.views.JPAListViewComponent;

import java.io.PrintWriter;
import java.io.StringWriter;

public class VaadinPort implements MDDPort {

    @Override
    public void alert(String msg) {
        Notification.show("Alert",
                msg,
                Notification.Type.HUMANIZED_MESSAGE);
    }

    @Override
    public void openCRUD(Class entityClass, String queryFilters, boolean modifierPressed) {
        System.out.println("open crud");

        ((MyUI)UI.getCurrent()).open(new JPAListViewComponent(entityClass));

    }

    @Override
    public void openEditor(Object object, boolean modifierPressed) {
        System.out.println("open editor");

        ((MyUI)UI.getCurrent()).open(new EditorViewComponent(object));
    }

    @Override
    public UserData getUserData() {
        return (UserData) UI.getCurrent().getSession().getAttribute("_userdata");
    }

    @Override
    public void openView(RPCView v, boolean modifierPressed) {
        System.out.println("open view");
    }

    @Override
    public void alert(Throwable throwable) {
        StringWriter sw = new StringWriter();
        throwable.printStackTrace(new PrintWriter(sw));
        Notification.show("Error",
                sw.toString(),
                Notification.Type.ERROR_MESSAGE);
    }
}
