package io.mateu.mdd.vaadin.controllers;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractMenu;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.vaadin.navigation.MDDViewComponentCreator;

public class ActionController extends Controller {

    @Override
    public Component apply(String path, String step, String remaining) throws Exception {
        App app = MDDUIAccessor.getApp();
        MenuEntry m = app.getMenu(path + "/" + step);
        Controller controller = new BrokenLinkController();
        if (m != null) {
            if (m instanceof AbstractMenu) controller = new MenuController((AbstractMenu) m);
            else if (m instanceof MDDOpenListViewAction) {
                controller = new ListViewController((MDDOpenListViewAction) m);
            } else if (m instanceof MDDOpenCRUDAction) {
                controller = new CrudController((MDDOpenCRUDAction)m);
                return MDDViewComponentCreator.createComponent((MDDOpenCRUDAction) m);
            }
        }
        return controller.next(path, step, remaining);
    }
}
