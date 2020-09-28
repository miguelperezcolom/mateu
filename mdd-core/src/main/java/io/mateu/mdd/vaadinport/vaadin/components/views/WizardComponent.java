package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.event.ShortcutAction;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class WizardComponent extends EditorViewComponent {

    private List<WizardPage> stack = new ArrayList<>();
    private WizardPage currentPage = null;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.FAST_FORWARD; //STEP_FORWARD;

    }

    public WizardComponent(WizardPage page) {
        super(page.getClass());
        setPage(page);
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> l = new ArrayList<>();

        l.add(new AbstractAction("Prev") {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ARROW_LEFT, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
            }

            @Override
            public void run() {
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

        }.setIcon(VaadinIcons.STEP_BACKWARD).setId("wizardprev"));

        l.add(new AbstractAction("Next") {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ARROW_RIGHT, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
            }

            @Override
            public void run() {
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

        }.setIcon(VaadinIcons.STEP_FORWARD).setId("wizardnext"));

        l.add(new AbstractAction(currentPage.getOkCaption()) {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ENTER, ShortcutAction.ModifierKey.CTRL, ShortcutAction.ModifierKey.ALT);
            }

            @Override
            public void run() {
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

        }.setIcon(VaadinIcons.CHECK).setId("wizarddone"));

        l.add(new AbstractAction(currentPage.getOkAndStayCaption()) {

            @Override
            public void addShortCut(Button b) {
                b.setClickShortcut(ShortcutAction.KeyCode.ENTER, ShortcutAction.ModifierKey.CTRL);
            }

            @Override
            public void run() {
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

        }.setIcon(VaadinIcons.CHECK_CIRCLE).setId("wizarddonealt"));

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
