package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.data.HasValue;
import com.vaadin.shared.Registration;
import com.vaadin.ui.Label;
import com.vaadin.ui.RichTextArea;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.AbstractViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ViewComponentHelper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.WizardComponent;
import org.vaadin.aceeditor.AceEditor;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public class FieldEditorComponent extends AbstractViewComponent{

    private FieldInterfaced field;
    private MDDBinder binder;

    @Override
    public String toString() {
        return "" + binder.getBean() + " / " + ReflectionHelper.getCaption(field);
    }

    public FieldEditorComponent(MDDBinder parentBinder, FieldInterfaced field) {
        super();
        this.binder = parentBinder;
        this.field = field;
    }

    @Override
    public boolean isBarHidden() {
        return true;
    }

    @Override
    public AbstractViewComponent build() throws Exception {
        super.build();

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
            setSizeFull();
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
            setSizeFull();
            RichTextArea t;
            addComponentsAndExpand(t = new RichTextArea());
            t.setSizeFull();
            t.focus();
            try {
                String v = (String) ReflectionHelper.getValue(field, binder.getBean());
                if (v == null) v = "";
                t.setValue((String) v);
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
            setSizeFull();
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
        } else {
            addComponent(new Label("Pendiente"));
            addComponentsAndExpand(new Label(""));
        }

        return this;
    }

    @Override
    public List<AbstractAction> getActions() {
        List l = super.getActions();

        Object bean = (binder != null)?binder.getBean():null;

        boolean isEditingNewRecord = MDDUI.get().isEditingNewRecord();


        List<Method> ms = new ArrayList<>();
        for (Method m : ReflectionHelper.getAllMethods(bean != null?bean.getClass():field.getDeclaringClass())) {
            if (!(Modifier.isStatic(m.getModifiers())
                            || (m.isAnnotationPresent(NotWhenCreating.class) && isEditingNewRecord)
                            || (m.isAnnotationPresent(NotWhenEditing.class) && !isEditingNewRecord))
                    && (m.isAnnotationPresent(Action.class) && field.getName().equals(m.getAnnotation(Action.class).attachToField()))
            ) {
                ms.add(m);
            }
        }

        ms.sort((a, b) -> {
            return a.getAnnotation(Action.class).order() - b.getAnnotation(Action.class).order();
        });

        ms.forEach(m -> {
            AbstractAction a;
            l.add(a = ViewComponentHelper.createAction(m, this));
        });


        return l;
    }
}
