package io.mateu.mdd.vaadin.controllers.firstLevel;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MDDOpenHtml;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.util.notification.Notifier;

public class PublicController extends Controller {

    public PublicController(ViewStack stack, String path) {

        if (MateuUI.get() != null) MateuUI.get().getMain().refreshHeader(false);

        App app = MDDUIAccessor.getApp();

        app.updateSession();

        // existe home?
        MenuEntry home = app.getDefaultPublicArea() != null?app.getDefaultPublicArea().getDefaultAction():null;
        if (home != null) {
            if (home instanceof MDDOpenHtml) {
                registerComponentInStack(stack, path, new HomeComponent(home.getIcon(), "Home", new Label(((MDDOpenHtml)home).html, ContentMode.HTML), false));
            } else {
                try {
                    new AcctionRunner().run((AbstractAction) home);
                } catch (Throwable e) {
                    Notifier.alert(e);
                }
            }
        } else {
            // si no, seguir hacia el área por defecto
            registerComponentInStack(stack, path, new FakeComponent("Public content"));
        }

    }


    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {

        if (!"".equals(step)) {

            App app = MDDUIAccessor.getApp();

            // si ya no es "/", entonces localizar el área y seguir
            AbstractArea area = (AbstractArea) app.getArea(path + "/" + step);
            Controller controller = area != null?new AreaController(stack, path + "/" + step, area):new BrokenLinkController(stack, path + "/" + step);

            controller.next(stack, path, step, remaining);

        }

    }
}
