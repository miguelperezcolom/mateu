package io.mateu.mdd.vaadin.controllers.firstLevel;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.MDDOpenHtml;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.actions.AcctionRunner;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.mdd.vaadin.components.HomeComponent;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.util.notification.Notifier;

public class AreaController extends Controller {
    private final AbstractArea area;

    public AreaController(ViewStack stack, String path, AbstractArea area) {
        super();
        this.area = area;
        if (MateuUI.get() != null) MateuUI.get().setArea(area);

        AbstractAction home = area.getDefaultAction();
        if (home != null) {
            if (home instanceof MDDOpenHtml) {
                register(stack, path, new HomeComponent(home.getIcon(), "" + area.getName(), new Label(((MDDOpenHtml)home).html, ContentMode.HTML), false));
            } else {
                try {
                    new AcctionRunner().run((AbstractAction) home);
                } catch (Throwable e) {
                    Notifier.alert(e);
                }
            }
        } else {
            register(stack, path, new AreaComponent(area));
        }

    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(step)) {
            App app = MDDUIAccessor.getApp();
            IModule m = app.getModule(path + "/" + step);
            Controller controller = null;
            if (m != null) {
                controller = new ModuleController(stack, path + "/" + step, m);
            } else {
                controller = new BrokenLinkController(stack, path + "/" + step);
            }
            controller.next(stack, path, step, remaining);
        }
    }
}
