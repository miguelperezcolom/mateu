package io.mateu.mdd.vaadin.actions;

import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.ComponentWrapper;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

public class AcctionRunner {


    public void run(AbstractAction action) throws Throwable {
        if (action instanceof MDDCallMethodAction) run((MDDCallMethodAction) action);
        else if (action instanceof MDDViewObject) run((MDDViewObject) action);
        else if (action instanceof MDDOpenCRUDAction) run((MDDOpenCRUDAction) action);
        else if (action instanceof MDDOpenCustomComponentAction) run((MDDOpenCustomComponentAction) action);
        else if (action instanceof MDDOpenEditorAction) run((MDDOpenEditorAction) action);
        else if (action instanceof MDDOpenListViewAction) run((MDDOpenListViewAction) action);
        else if (action instanceof MDDOpenHtml) run((MDDOpenHtml) action);
        else if (action instanceof MDDOpenWizardAction) run((MDDOpenWizardAction) action);
        else if (action instanceof MDDRunnableAction) run((MDDRunnableAction) action);
        else throw new Exception("Unrecognized action " + action);
    }

    public void run(MDDCallMethodAction action) {
        if (action.method == null) Notifier.alert("Method " + action.methodName + " does not exist in class " + action.type);
        else Opener.callMethod(action.method);
    }

    public void run(MDDViewObject action) {
        MateuUI.get().setPendingResult(action.o);
    }

    public void run(MDDOpenCRUDAction action) throws Exception {
        Opener.openCRUD(action);
    }

    public void run(MDDOpenCustomComponentAction action) throws Exception {
        Opener.open(action, (Component) (action.component != null?action.component: ReflectionHelper.newInstance(action.viewClass)));
    }

    public void run(MDDOpenEditorAction action) throws Throwable {
        Object bean = action.getBean();
        if (bean != null) Opener.openEditor(bean);
        else Opener.openEditor(action);
    }

    public void run(MDDOpenListViewAction action) throws Exception {
        Opener.openListView(action.listViewClass);
    }

    public void run(MDDOpenHtml action) throws Exception {
        run(new MDDOpenCustomComponentAction(action.getCaption(), new ComponentWrapper(action.getIcon(), "Home", new Label(action.html, ContentMode.HTML), true)));
    }

    public void run(MDDOpenWizardAction action) {
        Opener.openWizard(action.firstPageSupplier.get());
    }


    public void run(MDDRunnableAction action) throws Throwable {
        action.run();
    }

}
