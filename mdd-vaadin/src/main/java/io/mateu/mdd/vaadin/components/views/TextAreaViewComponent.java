package io.mateu.mdd.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class TextAreaViewComponent extends EditorViewComponent {

    private final MDDBinder parentBinder;
    private final FieldInterfaced field;
    private final HasValue hasValue;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.LIST_SELECT;
    }

    @Override
    public String getTitle() {
        return Helper.capitalize(field.getId());
    }

    public TextAreaViewComponent(MDDBinder parentBinder, FieldInterfaced field, HasValue hasValue) throws Exception {
        super(TextAreaFieldModel.class);
        this.parentBinder = parentBinder;
        this.field = field;
        this.hasValue = hasValue;
        setModel(new TextAreaFieldModel((String) hasValue.getValue()));
    }

    @Override
    public List<AbstractAction> getMainActions() {
        return List.of(new MDDRunnableAction("Save") {
            @Override
            public void run() throws Throwable {
                doSave();
                setInitialValues(buildSignature());
                goBack();
            }
        });
    }

    @Override
    public void save(boolean goBack, boolean notify, boolean copyEditableValues) throws Throwable {
        doSave();
        if (goBack) goBack();
    }

    private void doSave() {
        if (parentBinder != null) {
            try {
                hasValue.setValue(((TextAreaFieldModel)getModel()).getText());
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
    }
}
