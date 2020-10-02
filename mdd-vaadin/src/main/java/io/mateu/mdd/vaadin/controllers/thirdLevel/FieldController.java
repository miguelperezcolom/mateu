package io.mateu.mdd.vaadin.controllers.thirdLevel;

import com.vaadin.ui.Component;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class FieldController extends Controller {

    private final FieldInterfaced field;

    public FieldController(FieldInterfaced field) {
        this.field = field;
    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Exception {

        /*

        if (step.endsWith("_search")) {
            return MDDViewComponentCreator.createSearcherComponent(parentBinder, field);
        } else if (ReflectionHelper.isBasico(field.getType())) {
            return new FieldEditorComponent(parentBinder, field);
        } else {
            Object o = ReflectionHelper.getValue(field, parentBinder.getBean());
            boolean add = o == null;
            EditorViewComponent evc = add?new EditorViewComponent(field.getType()):new EditorViewComponent(o);
            if (add) evc.load(null);
            if (field.isAnnotationPresent(ManyToOne.class) && field.getAnnotation(ManyToOne.class).cascade() != null) for (CascadeType c : field.getAnnotation(ManyToOne.class).cascade()) {
                if (CascadeType.ALL.equals(c) || CascadeType.MERGE.equals(c)) {
                    evc.setCreateSaveButton(false);
                    break;
                }
            }

            evc.addEditorListener(new EditorListener() {
                @Override
                public void preSave(Object model) throws Throwable {

                }

                @Override
                public void onSave(Object model) {
                    try {
                        Object m = parentBinder.getBean();
                        ReflectionHelper.setValue(field, m, model);
                        parentBinder.getBinding(field.getName()).ifPresent(b -> {
                            ((Binder.Binding)b).getField().setValue(null);
                            ((Binder.Binding)b).getField().setValue(model);
                        });
                        parentBinder.setBean(m, false);
                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }

                @Override
                public void onGoBack(Object model) {
                    if ((field.isAnnotationPresent(Embedded.class)) || (field.getDeclaringClass().isAnnotationPresent(Entity.class) && field.isAnnotationPresent(Convert.class))) {
                        Object m = parentBinder.getBean();
                        try {
                            ReflectionHelper.setValue(field, m, model);
                            parentBinder.setBean(m, false);
                        } catch (Exception e) {
                            Notifier.alert(e);
                        }
                    }
                }
            });
            return evc;
        }

         */
    }
}
