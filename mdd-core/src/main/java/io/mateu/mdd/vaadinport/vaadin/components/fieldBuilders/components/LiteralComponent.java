package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.components;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.model.multilanguage.Literal;
import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class LiteralComponent extends Composite implements HasValue<Literal>, Component.Focusable {
    private final AbstractTextField tf;
    private final ComboBox<String> cb;
    private final MDDBinder binder;
    private Literal literal;
    private Map<UUID, ValueChangeListener> listeners = new HashMap<>();


    public LiteralComponent(FieldInterfaced field, MDDBinder binder) {
        this.binder = binder;

        Collection<String> langs = Lists.newArrayList("es", "en", "de", "fr", "it", "ar", "cz", "ru");

        tf = (field.isAnnotationPresent(io.mateu.mdd.core.annotations.TextArea.class))?new TextArea():new TextField();

        HorizontalLayout hl = new HorizontalLayout(tf, cb = new ComboBox<String>(null, langs), new Button(VaadinIcons.FLAG, (e) -> {

        }));
        cb.setWidth("80px");
        cb.setEmptySelectionAllowed(false);
        cb.setValue("es");

        cb.addValueChangeListener(e -> {
            if (literal != null) {
                String v = literal.getEs();
                if ("en".equals(e.getValue())) v = literal.getEn();
                if ("de".equals(e.getValue())) v = literal.getDe();
                if ("fr".equals(e.getValue())) v = literal.getFr();
                if ("it".equals(e.getValue())) v = literal.getIt();
                if ("ar".equals(e.getValue())) v = literal.getAr();
                if ("cz".equals(e.getValue())) v = literal.getCz();
                if ("ru".equals(e.getValue())) v = literal.getRu();
                if (v == null) v = "";
                tf.setValue(v);
            }
        });

        setCompositionRoot(hl);

        tf.setValueChangeMode(ValueChangeMode.BLUR);

        tf.addValueChangeListener(e -> {

            if (e.isUserOriginated()) {
                if ("en".equals(cb.getValue())) literal.setEn(e.getValue());
                else if ("de".equals(cb.getValue())) literal.setDe(e.getValue());
                else if ("fr".equals(cb.getValue())) literal.setFr(e.getValue());
                else if ("it".equals(cb.getValue())) literal.setIt(e.getValue());
                else if ("ar".equals(cb.getValue())) literal.setAr(e.getValue());
                else if ("cz".equals(cb.getValue())) literal.setCz(e.getValue());
                else if ("ru".equals(cb.getValue())) literal.setRu(e.getValue());
                else literal.setEs(e.getValue());

                if (!binder.getMergeables().contains(literal)) binder.getMergeables().add(literal);
            }

            ValueChangeEvent ce = new ValueChangeEvent(this, this, e.isUserOriginated());

            listeners.values().forEach(l -> l.valueChange(ce));

        });

    }

    @Override
    public void setValue(Literal o) {
        literal = o;
        if (literal == null) {
            literal = new Literal();
        }

        if (literal != null) {
            String v = literal.getEs();
            if ("en".equals(cb.getValue())) v = literal.getEn();
            if ("de".equals(cb.getValue())) v = literal.getDe();
            if ("fr".equals(cb.getValue())) v = literal.getFr();
            if ("it".equals(cb.getValue())) v = literal.getIt();
            if ("ar".equals(cb.getValue())) v = literal.getAr();
            if ("cz".equals(cb.getValue())) v = literal.getCz();
            if ("ru".equals(cb.getValue())) v = literal.getRu();
            if (v == null) v = "";
            tf.setValue(v);
        }
    }

    @Override
    public Literal getValue() {
        return literal;
    }

    @Override
    public void setRequiredIndicatorVisible(boolean b) {
        tf.setRequiredIndicatorVisible(b);
    }

    @Override
    public boolean isRequiredIndicatorVisible() {
        return tf.isRequiredIndicatorVisible();
    }

    @Override
    public void setReadOnly(boolean b) {
        tf.setReadOnly(b);
    }

    @Override
    public boolean isReadOnly() {
        return tf.isReadOnly();
    }

    @Override
    public Registration addValueChangeListener(ValueChangeListener<Literal> valueChangeListener) {
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
        tf.focus();
    }

    @Override
    public int getTabIndex() {
        return tf.getTabIndex();
    }

    @Override
    public void setTabIndex(int i) {
        tf.setTabIndex(i);
    }
}
