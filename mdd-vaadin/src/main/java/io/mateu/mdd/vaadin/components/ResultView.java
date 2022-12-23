package io.mateu.mdd.vaadin.components;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.HasActions;
import io.mateu.mdd.core.interfaces.HasIcon;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.ExpandOnOpen;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.FakeComponent;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.Result;
import io.mateu.mdd.vaadin.views.ComponentView;

import java.util.List;

public class ResultView extends ComponentView {
    private final Result result;

    private static VaadinIcons getIcon(Result result) {
        return result.getModel() instanceof HasIcon?((HasIcon)result.getModel()).getIcon():VaadinIcons.CHECK_CIRCLE;
    }

    public ResultView(ViewStack stack, String title, Result result) {
        super(stack, title, getIcon(result), getContent(result));
        this.result = result;
    }

    private static Component getContent(Result result) {

        VerticalLayout section = new VerticalLayout();
        section.addStyleName("section");
        section.addStyleName("result-page");

        Label check;
        section.addComponent(check = new Label(VaadinIcons.CHECK_CIRCLE.getHtml(), ContentMode.HTML));
        check.addStyleName(CSS.GREENFGD);
        check.addStyleName(ValoTheme.LABEL_H1);
        check.addStyleName("checkmark");
        section.setComponentAlignment(check, Alignment.MIDDLE_CENTER);

        Label label;
        section.addComponent(label = new Label(result.getModel().toString()));
        section.setComponentAlignment(label, Alignment.MIDDLE_CENTER);

        if (result.getModel() instanceof HasActions) ((HasActions) result.getModel()).getActions().forEach(action -> addAction(action));

        addBack(section);

        return section;
    }

    private static void addAction(AbstractAction action) {
        //todo: añadir botón / link
    }

    private static void addBack(VerticalLayout section) {
        ViewStack stack = MateuUI.get().getStack();
        View backToView = null;
        boolean listViewFound = false;
        for (int i = stack.size() -1; i >= 0 && !listViewFound; i--) {
            View v = stack.get(i);
            if (v.getViewComponent() instanceof ListViewComponent) {
                listViewFound = true;
                backToView = v;
            } else if (v.getViewComponent() instanceof EditorViewComponent) {
                backToView = v;
            }
        }
        if (backToView != null) {
            Button b;
            View finalBackToView = backToView;
            section.addComponent(b =
                    new Button("Back to " + backToView.getViewComponent().getTitle(),
                            e -> MDDUIAccessor.goTo(stack.getState(finalBackToView))));
            section.setComponentAlignment(b, Alignment.MIDDLE_CENTER);
            b.addStyleName(ValoTheme.BUTTON_QUIET);
        }
    }
}
