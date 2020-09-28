package io.mateu.mdd.vaadin.actions;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadin.MDDUI;
import io.mateu.mdd.vaadin.navigation.ComponentWrapper;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

public class AcctionRunner {

    public void run(AbstractAction action) throws Exception {
        throw new Exception("Unrecognized action " + action);
    }

    public void run(MDDCallMethodAction action) {
        if (action.method == null) Notifier.alert("Method " + action.methodName + " does not exist in class " + action.type);
        else MDDUI.get().callMethod(null, action.method, null, null);
    }

    public void run(MDDViewObject action) {
        MDDUI.get().setPendingResult(action.o);
    }

    public void run(MDDOpenCRUDAction action) throws Exception {
        MDDUI.get().getNavegador().getViewProvider().openCRUD(action);
    }

    public void run(MDDOpenCustomComponentAction action) throws Exception {
        MDDUI.get().getNavegador().getViewProvider().open(action, (Component) (action.component != null?action.component: ReflectionHelper.newInstance(action.viewClass)));
    }

    public void run(MDDOpenEditorAction action) throws Throwable {
        if (action.bean != null) MDDUI.get().getNavegador().getViewProvider().openEditor( action.bean);
        else MDDUI.get().getNavegador().getViewProvider().openEditor(action, action.viewClass, action.id);
    }

    public void run(MDDOpenListViewAction action) throws Exception {
        MDDUI.get().openListView(action, action.listViewClass);
    }

    public void run(MDDOpenHtml action) throws Exception {
        run(new MDDOpenCustomComponentAction(action.getCaption(), new ComponentWrapper(action.getIcon(), "Home", new Label(action.html, ContentMode.HTML), true)));
    }

    public void run(MDDOpenWizardAction action) {
        MDDUI.get().getPort().openWizard(action.firstPageClass);
    }

    public void run(MDDRunnableAction action) throws Throwable {
        action.run();
    }

}
