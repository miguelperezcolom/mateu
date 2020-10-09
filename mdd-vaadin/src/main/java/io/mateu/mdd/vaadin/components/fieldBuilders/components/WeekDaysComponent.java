package io.mateu.mdd.vaadin.components.fieldBuilders.components;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.shared.Registration;
import com.vaadin.ui.CheckBoxGroup;
import com.vaadin.ui.Component;
import com.vaadin.ui.Composite;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;

import java.util.*;

public class WeekDaysComponent extends Composite implements HasValue<boolean[]>, Component.Focusable {
    private final MDDBinder binder;
    private final CheckBoxGroup<String> g;
    private boolean[] array;
    private Map<UUID, ValueChangeListener> listeners = new HashMap<>();
    public static final List<String> days = Lists.newArrayList("Mo", "Tu", "We", "Th", "Fr", "Sa", "Su");


    public WeekDaysComponent(FieldInterfaced field, MDDBinder binder) {
        this.binder = binder;

        g = new CheckBoxGroup<>("", days);

        g.addValueChangeListener(e -> {

            if (e.isUserOriginated()) {

                if (array == null) {
                    array = new boolean[] {false, false, false, false, false, false, false};
                }

                for (int i = 0; i < array.length; i++) array[i] = e.getValue().contains(days.get(i));

                ValueChangeEvent ce = new ValueChangeEvent(this, this, e.isUserOriginated());

                listeners.values().forEach(l -> l.valueChange(ce));

            }

        });

        setCompositionRoot(g);

    }

    @Override
    public void setValue(boolean[] o) {
        array = o;
        if (array == null) {
            array = new boolean[] {false, false, false, false, false, false, false};
        }

        if (array != null) {

            Set<String> values = new HashSet<>();
            for (int i = 0; i < array.length; i++) if (array[i]) values.add(days.get(i));
            g.setValue(values);

        }
    }

    @Override
    public boolean[] getValue() {
        return array;
    }

    @Override
    public void setRequiredIndicatorVisible(boolean b) {
        g.setRequiredIndicatorVisible(b);
    }

    @Override
    public boolean isRequiredIndicatorVisible() {
        return g.isRequiredIndicatorVisible();
    }

    @Override
    public void setReadOnly(boolean b) {
        g.setReadOnly(b);
    }

    @Override
    public boolean isReadOnly() {
        return g.isReadOnly();
    }

    @Override
    public Registration addValueChangeListener(ValueChangeListener<boolean[]> valueChangeListener) {
        UUID _id = UUID.randomUUID();
        listeners.put(_id, valueChangeListener);
        return new Registration() {

            UUID id = _id;

            @Override
            public void remove() {
                listeners.remove(id);
            }
        };
    }

    @Override
    public void focus() {
        g.focus();
    }

    @Override
    public int getTabIndex() {
        return g.getTabIndex();
    }

    @Override
    public void setTabIndex(int i) {
        g.setTabIndex(i);
    }
}
