package io.mateu.mdd.vaadin.controllers.secondLevel;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.controllers.firstLevel.MenuController;
import io.mateu.mdd.vaadin.navigation.MDDViewComponentCreator;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.util.notification.Notifier;

public class ActionController extends Controller {

    public ActionController(ViewStack stack, String path) {
    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(step)) {
            App app = MDDUIAccessor.getApp();

            Controller controller = null;
            try {
                MenuEntry m = app.getMenu(path + "/" + cleanStep);
                if (m != null) {
                    if (m instanceof AbstractMenu) controller = new MenuController(stack, path + "/" + step, (AbstractMenu) m);
                    else if (m instanceof MDDOpenListViewAction) {
                        controller = new ListViewController(stack, path + "/" + step, (MDDOpenListViewAction) m);
                    } else if (m instanceof MDDOpenCRUDAction) {
                        controller = new CrudController(stack, path + "/" + step, (MDDOpenCRUDAction)m);
                    } else if (m instanceof MDDOpenEditorAction) {
                        controller = new EditorController(stack, path + "/" + step, (MDDOpenEditorAction)m);
                    }
                }
                if (controller == null) controller = new BrokenLinkController(stack, path + "/" + step);

                controller.next(stack, path, step, remaining);
            } catch (Throwable e) {
                Notifier.alert(e);
            }

        }
    }
}
