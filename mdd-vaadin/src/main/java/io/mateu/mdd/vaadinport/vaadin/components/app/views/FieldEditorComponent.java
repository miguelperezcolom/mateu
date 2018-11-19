package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Label;
import com.vaadin.ui.RichTextArea;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Code;
import io.mateu.mdd.core.annotations.Html;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.annotations.Wizard;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorListener;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.WizardComponent;
import org.vaadin.aceeditor.AceEditor;

import javax.persistence.Convert;
import javax.persistence.Embedded;
import javax.persistence.Entity;

public class FieldEditorComponent extends VerticalLayout {

    private EditorViewComponent editor;
    private FieldInterfaced field;
    private MDDBinder binder;

    @Override
    public String toString() {
        return "Editing field " + ReflectionHelper.getCaption(field);
    }

    public FieldEditorComponent(MDDBinder binder, FieldInterfaced field) {
        this.binder = binder;
        this.field = field;

        addStyleName("methodresultflowcomponent");

        if (!MDD.isMobile()) setSizeFull();


        //todo: quitar código duplicado

        if (field.isAnnotationPresent(Wizard.class)) {

            HasValue hv = new HasValue() {
                @Override
                public void setValue(Object value) {
                    Object bean = binder.getBean();

                    try {

                        ReflectionHelper.setValue(field, bean, value);

                        binder.setBean(bean, false);

                    } catch (Exception e) {
                        MDD.alert(e);
                    }

                }

                @Override
                public Object getValue() {
                    try {
                        return ReflectionHelper.getValue(field, binder.getBean());
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                    return null;
                }

                @Override
                public Registration addValueChangeListener(ValueChangeListener valueChangeListener) {
                    return null;
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
            };

            try {
                addComponent(new WizardComponent((WizardPage) field.getAnnotation(Wizard.class).value().getConstructor(HasValue.class).newInstance(hv)));
            } catch (Exception e) {
                MDD.alert(e);
            }


        } else if (field.isAnnotationPresent(TextArea.class)) {
            com.vaadin.ui.TextArea t;
            addComponentsAndExpand(t = new com.vaadin.ui.TextArea());
            t.setSizeFull();
            t.focus();
            try {
                String v = (String) ReflectionHelper.getValue(field, binder.getBean());
                t.setValue((v != null)?v:"");
            } catch (Exception e) {
                MDD.alert(e);
            }
            t.addValueChangeListener(new HasValue.ValueChangeListener<String>() {
                @Override
                public void valueChange(HasValue.ValueChangeEvent<String> valueChangeEvent) {
                    try {
                        Object m = binder.getBean();
                        ReflectionHelper.setValue(field, m, valueChangeEvent.getValue());
                        binder.setBean(m, false);
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
                            binder.setBean(m, false);
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
                        binder.setBean(m, false);
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }
            });
        //} else if (field.getType().isAnnotationPresent(Entity.class)) {
        } else if (true) {

            addComponent(editor = new EditorViewComponent(field.getType()));
            try {
                Object parent = binder.getBean();
                Object v = ReflectionHelper.getValue(field, parent);
                editor.load((v != null)?((v.getClass().isAnnotationPresent(Entity.class))?ReflectionHelper.getId(v):ReflectionHelper.clone(v)):null, parent, field);
            } catch (Throwable throwable) {
                MDD.alert(throwable);
            }


            editor.addEditorListener(new EditorListener() {
                @Override
                public void onSave(Object v) {
                    try {
                        Object m = binder.getBean();
                        ReflectionHelper.setValue(field, m, v);
                        binder.getBinding(field.getName()).ifPresent(b -> {
                            ((Binder.Binding)b).getField().setValue(null);
                            ((Binder.Binding)b).getField().setValue(v);
                        });
                        binder.setBean(m, false);
                    } catch (Exception e) {
                        MDD.alert(e);
                    }
                }

                @Override
                public void onGoBack(Object model) {
                    if ((field.isAnnotationPresent(Embedded.class)) || (field.getDeclaringClass().isAnnotationPresent(Entity.class) && field.isAnnotationPresent(Convert.class))) {
                        Object m = binder.getBean();
                        try {
                            Object value = editor.getBinder().getBean();
                            ReflectionHelper.setValue(field, m, value);
                            binder.setBean(m, false);
                        } catch (Exception e) {
                            MDD.alert(e);
                        }
                    }
                }
            });

        } else {
            addComponent(new Label("Pendiente"));
            addComponentsAndExpand(new Label(""));
        }


    }

    public EditorViewComponent getEditor() {
        return editor;
    }
}
