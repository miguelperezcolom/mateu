package io.mateu.mdd.vaadin.components.views;

import com.vaadin.event.selection.SingleSelectionEvent;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.ComboBox;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import io.mateu.util.persistence.JPAHelper;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
public class ReferencedEntityViewComponent extends EditorViewComponent {

    private final MDDBinder parentBinder;
    private final FieldInterfaced field;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.LIST_SELECT;
    }

    public ReferencedEntityViewComponent(MDDBinder parentBinder, FieldInterfaced field) throws Exception {
        super(field.getType());
        this.parentBinder = parentBinder;
        this.field = field;
        setModel(ReflectionHelper.getValue(field, parentBinder.getBean()));
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


    private void doSave() throws Throwable {

        JPAHelper.transact(em -> {
            em.merge(getBinder().getBean());
        });

        if (parentBinder != null) {
            try {
                Object o = parentBinder.getBean();
                ReflectionHelper.setValue(field, o, getBinder().getBean());
                parentBinder.update(o);
                ComboBox cb = (ComboBox) parentBinder.getFields().filter(f -> f instanceof ComboBox)
                        .filter(c -> field.getId().equals(((ComboBox)c).getId()))
                        .findFirst().orElseGet(null);
                if (cb != null) {
                    if (cb.getDataProvider() instanceof JPQLListDataProvider) {
                        ((JPQLListDataProvider)cb.getDataProvider()).refresh();
                    } else {
                        cb.getDataProvider().refreshItem(getBinder().getBean());
                    }
                }
            } catch (Exception e) {
                Notifier.alert(e);
            }
        }
    }
}
