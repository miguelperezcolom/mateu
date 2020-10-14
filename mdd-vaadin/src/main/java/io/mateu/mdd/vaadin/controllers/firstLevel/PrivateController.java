package io.mateu.mdd.vaadin.controllers.firstLevel;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MDDOpenHtml;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IArea;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Profile;
import io.mateu.util.notification.Notifier;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class PrivateController extends Controller {

    public PrivateController(ViewStack stack, String path) {

        if (MateuUI.get() != null) MateuUI.get().getMain().refreshHeader(true);

        App app = MDDUIAccessor.getApp();

        app.updateSession();

        if (app.getDefaultPrivateArea() != null) {
            // existe home?
            MenuEntry home = app.getDefaultPrivateArea().getDefaultAction();
            if (home != null) {
                if (home instanceof MDDOpenHtml) {
                    register(stack, path, new ComponentWrapper(home.getIcon(), "Home", new Label(((MDDOpenHtml)home).html, ContentMode.HTML), false));
                } else {
                    try {
                        new AcctionRunner().run((AbstractAction) home);
                    } catch (Throwable e) {
                        Notifier.alert(e);
                    }
                }
            } else {
                // si no, seguir hacia el área por defecto
                new AreaController(stack, path, (AbstractArea) app.getDefaultPrivateArea());
            }
        }

    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {


        if ("".equals(step)) {

        } else if ("profile".equals(step)) {
            register(stack, path + "/" + step, MDDViewComponentCreator.createComponent(Profile.class, MDDUIAccessor.getCurrentUserLogin()));
        } else {
            // si ya no es "/", entonces localizar el área y seguir
            App app = MDDUIAccessor.getApp();

            AbstractArea area = (AbstractArea) app.getArea(path + "/" + step);
            Controller controller = area != null?new AreaController(stack, path, area):new BrokenLinkController(stack, path + "/" + step);

            controller.next(stack, path, step, remaining);
        }

    }
}
