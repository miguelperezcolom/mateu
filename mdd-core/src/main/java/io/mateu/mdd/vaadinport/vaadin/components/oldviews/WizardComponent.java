package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Panel;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDViewComponentCreator;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class WizardComponent extends EditorViewComponent {

    private List<WizardPage> stack = new ArrayList<>();
    private WizardPage currentPage = null;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.STEP_FORWARD;
    }

    public WizardComponent(WizardPage page) {
        super(page.getClass());
        setPage(page);
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();

        l.add(new AbstractAction("wizardprev", VaadinIcons.ARROW_LEFT, "Prev") {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ARROW_LEFT, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
            }

            @Override
            public void run(MDDExecutionContext context) {
                WizardPage prevPage = stack.remove(0);
                currentPage = null;
                try {
                    setPage(prevPage);
                } catch (Exception e1) {
                    MDD.alert(e1);
                }
            }

            @Override
            public boolean isVisible() {
                return stack.size() > 0;
            }
        });

        l.add(new AbstractAction("wizardnext", VaadinIcons.ARROW_RIGHT, "Next") {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ARROW_RIGHT, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
            }

            @Override
            public void run(MDDExecutionContext context) {
                if (validate()) {
                    WizardPage nextPage = currentPage.getNext();
                    try {
                        setPage(nextPage);
                    } catch (Exception e1) {
                        MDD.alert(e1);
                    }
                }
            }

            @Override
            public boolean isVisible() {
                return currentPage.hasNext();
            }
        });

        l.add(new AbstractAction("wizarddone", VaadinIcons.CHECK, "Done") {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ENTER, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
            }

            @Override
            public void run(MDDExecutionContext context) {
                if (validate()) {
                    try {

                        currentPage.onOk();

                        if (currentPage.backOnOk()) MDDUI.get().getNavegador().goBack();

                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                }
            }

            @Override
            public boolean isVisible() {
                return !currentPage.hasNext();
            }
        });

        l.add(new AbstractAction("wizarddonealt", VaadinIcons.CHECK_CIRCLE, "Done and repeat") {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ENTER, ShortcutAction.ModifierKey.CTRL);
            }

            @Override
            public void run(MDDExecutionContext context) {
                if (validate()) {
                    try {

                        currentPage.onOk();

                        MDD.info("Done");

                    } catch (Throwable throwable) {
                        MDD.alert(throwable);
                    }
                }
            }

            @Override
            public boolean isVisible() {
                return !currentPage.hasNext() && currentPage.backOnOk();
            }
        });

        l.addAll(super.getActions());

        return l;
    }

    private void setPage(WizardPage page) {
        if (currentPage != null) stack.add(0, currentPage);
        currentPage = page;

        setModel(page);

        MDD.updateTitle(Helper.capitalize(currentPage.getClass().getSimpleName()));
    }

    @Override
    public String toString() {
        return Helper.capitalize(currentPage.getClass().getSimpleName());
    }

}
