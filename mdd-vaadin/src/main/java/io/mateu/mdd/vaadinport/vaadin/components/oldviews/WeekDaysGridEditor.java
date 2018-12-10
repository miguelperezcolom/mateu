package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.shared.Registration;
import com.vaadin.ui.CheckBoxGroup;
import com.vaadin.ui.Composite;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.components.WeekDaysComponent;

import java.util.*;

public class WeekDaysGridEditor extends Composite implements HasValue<String> {

    List<String> days = Lists.newArrayList("Mo", "Tu", "We", "Th", "Fr", "Sa", "Su");
    CheckBoxGroup<String> g = new CheckBoxGroup<>("", days);
    final boolean[] array = {false, false, false, false, false, false, false};
    Map<UUID, ValueChangeListener> listeners = new HashMap<>();

    public WeekDaysGridEditor() {

        g.addStyleName(ValoTheme.OPTIONGROUP_HORIZONTAL);
        g.addStyleName("weekdaysinlineeditor");

        g.setItemCaptionGenerator(s -> "");

        g.addValueChangeListener(e -> {

            if (e.isUserOriginated()) {

                for (int i = 0; i < array.length; i++) array[i] = e.getValue().contains(days.get(i));

                HasValue.ValueChangeEvent ce = new HasValue.ValueChangeEvent(g, g, e.isUserOriginated());

                listeners.values().forEach(l -> l.valueChange(ce));

            }

        });

        setCompositionRoot(g);
    }


    @Override
    public void setValue(String o) {
        System.out.println("setValue(" + o + ")");
        for (int i = 0; i < array.length; i++) array[i] = false;
        if (o != null) {
            for (int i = 0; i < days.size(); i++) if (i < array.length) array[i] = o.contains(days.get(i));
        }
        Set<String> values = new HashSet<>();
        for (int i = 0; i < array.length; i++) if (array[i]) values.add(days.get(i));
        g.setValue(values);
    }

    @Override
    public String getValue() {
        System.out.println("getValue()");
        String s = "";

        for (int i = 0; i < array.length; i++) {
            if (!"".equals(s)) s += ",";
            s += array[i]?WeekDaysComponent.days.get(i):"-";
        }

        return s;
    }

    @Override
    public Registration addValueChangeListener(ValueChangeListener<String> valueChangeListener) {
        System.out.println("addValueChangeListener(" + valueChangeListener + ")");
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
    public void setRequiredIndicatorVisible(boolean b) {

    }

    @Override
    public boolean isRequiredIndicatorVisible() {
        return false;
    }

    @Override
    public void setReadOnly(boolean b) {

    }

    @Override
    public boolean isReadOnly() {
        return false;
    }

}
