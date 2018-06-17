package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.*;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.CompositeErrorMessage;
import com.vaadin.server.ErrorMessage;
import com.vaadin.shared.ui.ErrorLevel;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.Stylist;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.VoidStylist;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.fields.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.data.ChangeNotificationListener;
import io.mateu.mdd.vaadinport.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.navigation.MDDNavigator;
import javafx.beans.value.ChangeListener;
import javafx.util.Pair;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class EditorViewComponent extends AbstractViewComponent {

    private Map<HasValue, List<Validator>> validators = new HashMap<>();

    protected boolean newRecord;
    private Object model;
    private final Class modelType;

    private MDDBinder binder;

    private AbstractStylist stylist;

    public List<Object> getMergeables() {
        return binder.getMergeables();
    }

    public EditorViewComponent(Class modelType) {

        this.modelType = modelType;
        try {
            this.model = modelType.newInstance();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

        setViewTitle(modelType.getSimpleName());
    }


    public EditorViewComponent(Object model) {
        this.modelType = model.getClass();
        this.model = model;
    }

    public Object getModel() {
        return model;
    }

    public void setModel(Object model) {
        this.model = model;
        binder.setBean(model);
        setViewTitle(stylist.getViewTitle(newRecord, model));
    }

    public Class getModelType() {
        return modelType;
    }

    @Override
    public EditorViewComponent build() throws IllegalAccessException, InstantiationException {

        super.build();

        addStyleName("editorviewcomponent");


        binder = new MDDBinder(modelType);
        //binder = new Binder(modelType, true);

        Pair<Component, AbstractStylist> r = FormLayoutBuilder.build(binder, modelType, model, validators, getAllFields());

        stylist = r.getValue();
        addComponent(r.getKey());

        return this;
    }

    private List<FieldInterfaced> getAllFields() {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(modelType);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Ignored.class) || (f.isAnnotationPresent(Id.class) && f.isAnnotationPresent(GeneratedValue.class)))
        ).collect(Collectors.toList());

        return allFields;
    }

    @Override
    public void addViewActionsMenuItems(MenuBar bar) {

        super.addViewActionsMenuItems(bar);

        bar.addItem("Save", VaadinIcons.DOWNLOAD, new MenuBar.Command() {
            @Override
            public void menuSelected(MenuBar.MenuItem menuItem) {
                try {

                    //binder.writeBean(model);

                    ValueContext vc = new ValueContext();
                    for (HasValue h : validators.keySet()) for (Validator v : validators.get(h)) {
                        ValidationResult r = v.apply(h.getValue(), vc);
                        if (h instanceof AbstractComponent) {
                            AbstractComponent c = (AbstractComponent) h;
                            if (r.isError()) {
                                c.setComponentError(new ErrorMessage() {
                                    @Override
                                    public ErrorLevel getErrorLevel() {
                                        return r.getErrorLevel().get();
                                    }

                                    @Override
                                    public String getFormattedHtmlMessage() {
                                        return r.getErrorMessage();
                                    }
                                });
                            } else {
                                c.setComponentError(null);
                            }
                        }
                    }

                    if (binder.allValid()) {
                        save();

                        // cambiamos la url, para reflejar el cambio

                        ((MyUI)UI.getCurrent()).goTo(getOriginatingAction(), getModelType(), ReflectionHelper.getId(model));

                    }
                    else Notification.show("There are errors", Notification.Type.ERROR_MESSAGE);


                } catch (Throwable throwable) {
                    MDD.alert(throwable);
                }
            }
        });
    }


    public abstract void save() throws Throwable;

    public abstract void load(Object id) throws Throwable;

    public AbstractStylist getStylist() {
        return stylist;
    }

    public void setStylist(AbstractStylist stylist) {
        this.stylist = stylist;
    }
}
