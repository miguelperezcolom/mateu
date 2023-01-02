package io.mateu.mdd.vaadin.components.views;

import com.google.common.collect.Iterables;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.ClassOption;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.util.VaadinHelper;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.function.Consumer;

@Slf4j
public class OwnedPojoViewComponent extends EditorViewComponent {

    private final MDDBinder parentBinder;
    private final FieldInterfaced field;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.LIST_SELECT;
    }

    public OwnedPojoViewComponent(MDDBinder parentBinder, FieldInterfaced field) throws Exception {
        super(field.getType());
        this.parentBinder = parentBinder;
        this.field = field;
        setModel(ReflectionHelper.clone(ReflectionHelper.getValue(field, parentBinder.getBean())));
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
                Object o = parentBinder.getBean();
                ReflectionHelper.setValue(field, o, getBinder().getBean());
                parentBinder.update(o);
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
    }
}
