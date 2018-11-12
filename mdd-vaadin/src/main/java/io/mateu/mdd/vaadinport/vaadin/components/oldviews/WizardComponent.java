package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDViewComponentCreator;

import java.util.ArrayList;
import java.util.List;

public class WizardComponent extends VerticalLayout {

    private final Button goToPreviousButton;
    private final Button goToNextButton;
    private final VerticalLayout container;
    private final Button okButton;
    private List<WizardPage> stack = new ArrayList<>();
    private WizardPage currentPage = null;
    private EditorViewComponent editorViewComponent;

    public EditorViewComponent getEditorViewComponent() {
        return editorViewComponent;
    }

    public WizardComponent(WizardPage page) throws IllegalAccessException, InstantiationException {

        addStyleName(CSS.NOPADDING);

        addComponent(container = new VerticalLayout());
        container.addStyleName(CSS.NOPADDING);


        HorizontalLayout hl;
        addComponent(hl = new HorizontalLayout(goToPreviousButton = new Button(VaadinIcons.ARROW_LEFT), goToNextButton = new Button(VaadinIcons.ARROW_RIGHT), okButton = new Button(VaadinIcons.CHECK)));
        hl.addStyleName(CSS.NOPADDING);

        addComponentsAndExpand(new Label(""));

        goToPreviousButton.addClickListener(e -> {
            WizardPage prevPage = stack.remove(0);
            currentPage = null;
            try {
                setPage(prevPage);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });


        goToNextButton.addClickListener(e -> {
           WizardPage nextPage = currentPage.getNext();
            try {
                setPage(nextPage);
            } catch (Exception e1) {
                MDD.alert(e1);
            }
        });

        okButton.addClickListener(e -> {
            try {

                currentPage.onOk();

                MDDUI.get().getNavegador().goBack();

            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }
        });

        setPage(page);

        addAttachListener(x -> {
            System.out.println("attached!");
            if (editorViewComponent != null) {
                editorViewComponent.getBinder().addValueChangeListener(e -> {
                    updateButtons();
                });
            }
            updateButtons();
        });
    }

    private void setPage(WizardPage page) throws IllegalAccessException, InstantiationException {

        editorViewComponent = MDDViewComponentCreator.createEditorViewComponent(page.getClass(), false);
        editorViewComponent.setModel(page);
        editorViewComponent.addStyleName(CSS.NOPADDING);

        editorViewComponent.getBinder().addValueChangeListener(e -> {
            updateButtons();
        });

        container.removeAllComponents();


        container.addComponent(editorViewComponent);

        if (currentPage != null) stack.add(0, currentPage);
        currentPage = page;

        MDD.updateTitle(Helper.capitalize(currentPage.getClass().getSimpleName()));

        updateButtons();
    }

    private void updateButtons() {
        goToPreviousButton.setVisible(stack.size() > 0);
        goToNextButton.setVisible(currentPage.hasNext());
        okButton.setVisible(!currentPage.hasNext());

        boolean valid = editorViewComponent.getBinder().validate().isOk() && currentPage.isValid();

        goToNextButton.setEnabled(valid);
        okButton.setEnabled(valid);
    }

    @Override
    public String toString() {
        return Helper.capitalize(currentPage.getClass().getSimpleName());
    }

}
