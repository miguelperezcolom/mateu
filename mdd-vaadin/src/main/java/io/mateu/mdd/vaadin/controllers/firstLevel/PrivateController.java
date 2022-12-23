package io.mateu.mdd.vaadin.controllers.firstLevel;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MDDOpenHtml;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.pojos.PrivateHome;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.components.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Profile;
import io.mateu.util.notification.Notifier;

public class PrivateController extends Controller {

    public PrivateController() {
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {

        if (MateuUI.get() != null) MateuUI.get().getMain().refreshHeader(true);

        App app = MDDUIAccessor.getApp();

        app.updateSession();

        if ("profile".equals(step)) {
            return MDDUIAccessor.getCurrentUser();
        }
        if (!"".equals(step)) {
            // si ya no es "/", entonces localizar el área y seguir
            return app.getArea(path + "/" + step);
        }

        return null;
    }
}
