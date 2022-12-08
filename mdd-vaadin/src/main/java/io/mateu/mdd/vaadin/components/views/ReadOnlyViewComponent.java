package io.mateu.mdd.vaadin.components.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.navigation.MateuViewProvider;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class ReadOnlyViewComponent extends EditorViewComponent {

    private List<AbstractAction> cachedActions;

    public ReadOnlyViewComponent(Class modelType) {
        this(modelType, true);
    }

    public ReadOnlyViewComponent(ListViewComponent listViewComponent, Class modelType) {
        this(listViewComponent, modelType, true);
    }

    public ReadOnlyViewComponent(ListViewComponent listViewComponent, Object owner, FieldInterfaced field, Class modelType, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields, boolean createSaveButton) {
        super(listViewComponent, owner, field, modelType, visibleFields, hiddenFields, createSaveButton);
    }

    public ReadOnlyViewComponent(Object owner, FieldInterfaced field, Class modelType, boolean createSaveButton) {
        this(null, owner, field, modelType, new ArrayList<>(), new ArrayList<>(), createSaveButton);
    }

    public ReadOnlyViewComponent(Class modelType, boolean createSaveButton) {
        this(null, null, modelType, createSaveButton);
    }

    public ReadOnlyViewComponent(ListViewComponent listViewComponent, Class modelType, boolean createSaveButton) {
        this(listViewComponent, null, null, modelType, new ArrayList<>(), new ArrayList<>(), createSaveButton);
    }

    public ReadOnlyViewComponent(Object model) {
        this(model, true);
    }

    public ReadOnlyViewComponent(Object model, Component lastViewComponent) {
        this(lastViewComponent instanceof ListViewComponent? (ListViewComponent) lastViewComponent :null, model, null, null, true);
    }

    public ReadOnlyViewComponent(Object model, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields) {
        this(model, visibleFields, hiddenFields, true);
    }

    public ReadOnlyViewComponent(ListViewComponent listViewComponent, Object model, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields) {
        this(listViewComponent, model, visibleFields, hiddenFields, true);
    }

    public ReadOnlyViewComponent(Object model, boolean createSaveButton) {
        this(model, new ArrayList<>(), new ArrayList<>(), createSaveButton);
    }

    public ReadOnlyViewComponent(Object model, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields, boolean createSaveButton) {
        this(null, model, visibleFields, hiddenFields, createSaveButton);
    }

    public ReadOnlyViewComponent(ListViewComponent listViewComponent, Object model, List<FieldInterfaced> visibleFields, List<FieldInterfaced> hiddenFields, boolean createSaveButton) {
        super(listViewComponent, model, visibleFields, hiddenFields, createSaveButton);
    }

    @Override
    public List<AbstractAction> getActions(String key) {
        if (cachedActions == null) {
            cachedActions = super.getActions(key);
            cachedActions.add(new MDDRunnableAction("") {

                @Override
                public String getId() {
                    return "edit";
                }

                @Override
                public void run() throws Throwable {
                    //MDDUIAccessor.setPendingResult(((ReadOnlyPojo)getModel()).getEditor());
                    MDDUIAccessor.go("edit");
                }

                @Override
                public VaadinIcons getIcon() {
                    return VaadinIcons.EDIT;
                }


            });
        }
        return cachedActions;
    }
}
