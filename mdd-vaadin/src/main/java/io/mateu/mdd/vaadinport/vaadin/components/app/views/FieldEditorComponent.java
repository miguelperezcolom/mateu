package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.data.HasValue;
import com.vaadin.ui.Label;
import com.vaadin.ui.RichTextArea;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Code;
import io.mateu.mdd.core.annotations.Html;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.data.MDDBinder;
import org.vaadin.aceeditor.AceEditor;

public class FieldEditorComponent extends VerticalLayout {

    private FieldInterfaced field;
    private MDDBinder binder;

    @Override
    public String toString() {
        return "Editing field " + Helper.capitalize(field.getName());
    }

    public FieldEditorComponent(MDDBinder binder, FieldInterfaced field) {
        this.binder = binder;
        this.field = field;

        addStyleName("methodresultflowcomponent");


        //todo: quitar código duplicado

        if (field.isAnnotationPresent(TextArea.class)) {
            com.vaadin.ui.TextArea t;
            addComponentsAndExpand(t = new com.vaadin.ui.TextArea());
            t.setSizeFull();
            t.focus();
            try {
                t.setValue((String) ReflectionHelper.getValue(field, binder.getBean()));
            } catch (Exception e) {
                MDD.alert(e);
            }
            t.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
                @Override
                public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                    try {
                        Object m = binder.getBean();
                        ReflectionHelper.setValue(field, m, valueChangeEvent.getValue());
                        binder.setBean(m);
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }
            });
        } else if (field.isAnnotationPresent(Html.class)) {
                RichTextArea t;
                addComponentsAndExpand(t = new RichTextArea());
                t.setSizeFull();
                t.focus();
                try {
                    t.setValue((String) ReflectionHelper.getValue(field, binder.getBean()));
                } catch (Exception e) {
                    MDD.alert(e);
                }
                t.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
                    @Override
                    public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                        try {
                            Object m = binder.getBean();
                            ReflectionHelper.setValue(field, m, valueChangeEvent.getValue());
                            binder.setBean(m);
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    }
                });
        } else if (field.isAnnotationPresent(Code.class)) {
            AceEditor t;
            addComponentsAndExpand(t = new AceEditor());
            t.setMode(field.getAnnotation(Code.class).mode());
            t.setTheme(field.getAnnotation(Code.class).theme());

            t.setSizeFull();
            t.focus();
            try {
                t.setValue((String) ReflectionHelper.getValue(field, binder.getBean()));
            } catch (Exception e) {
                MDD.alert(e);
            }
            t.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
                @Override
                public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                    try {
                        Object m = binder.getBean();
                        ReflectionHelper.setValue(field, m, valueChangeEvent.getValue());
                        binder.setBean(m);
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }
            });        } else {
            addComponent(new Label("Pendiente"));
            addComponentsAndExpand(new Label(""));
        }


    }

}
