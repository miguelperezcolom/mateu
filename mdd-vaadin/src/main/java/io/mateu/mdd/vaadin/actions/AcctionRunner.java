package io.mateu.mdd.vaadin.actions;

import com.vaadin.server.Page;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenUrlAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.app.MDDViewObject;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.util.notification.Notifier;

import java.net.URL;

public class AcctionRunner {


    public void run(AbstractAction action) throws Throwable {
        if (action instanceof MDDViewObject) run((MDDViewObject) action);
        else if (action instanceof MDDRunnableAction) run((MDDRunnableAction) action);
        else if (action instanceof MDDOpenUrlAction) run((MDDOpenUrlAction) action);
        else throw new Exception("Unrecognized action " + action);
    }

    public void run(MDDViewObject action) {
        MateuUI.get().setPendingResult(action.o);
    }


    public void run(MDDOpenUrlAction action) throws Throwable {
        URL url = action.getUrl();
        if (url != null) {
            Page.getCurrent().open(url.toString(), "_blank");
        } else {
            Notifier.alert("Empty url");
        }

    }


    public void run(MDDRunnableAction action) throws Throwable {
        action.run();
    }

}
