package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.Binder;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.validator.BeanValidator;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.shared.ui.grid.HeightMode;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.core.interfaces.Card;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.annotations.DataProvider;
import io.mateu.mdd.shared.annotations.FullWidth;
import io.mateu.mdd.shared.annotations.Money;
import io.mateu.mdd.shared.annotations.UseTable;
import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;
import org.javamoney.moneta.FastMoney;

import javax.money.MonetaryAmount;
import javax.persistence.Entity;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.DecimalFormat;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class JPAOutputFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        return String.class.equals(field.getType());
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field, Object object, Layout container, MDDBinder binder, Map<HasValue, List<Validator>> validators, AbstractStylist stylist, Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter, Map<String, List<AbstractAction>> attachedActions) {

        Component r = null;

        if (!forSearchFilter) {

            if (IResource.class.isAssignableFrom(field.getType())) {

                VerticalLayout hl = new VerticalLayout();

                Label l;
                hl.addComponent(l = new Label("", ContentMode.HTML));
                l.addStyleName("collectionlinklabel");
                hl.addStyleName(CSS.NOPADDING);

                hl.setCaption(ReflectionHelper.getCaption(field));

                addComponent(container, hl, attachedActions.get(field.getName()));

                bindResourcesList(binder, l, field);

                if (allFieldContainers != null) allFieldContainers.put(field, hl);


            } else if (Collection.class.isAssignableFrom(field.getType())) {


                Method mh;
                if (Set.class.isAssignableFrom(field.getType())) {
                    Label l;
                    l = new Label("", ContentMode.HTML);
                    l.setCaption(ReflectionHelper.getCaption(field));

                    addComponent(container, l, attachedActions.get(field.getName()));

                    if (allFieldContainers != null) allFieldContainers.put(field, l);

                    JPAOneToManyFieldBuilder.bindSet(binder, l, field);
                } else if (false && field.isAnnotationPresent(UseTable.class)) {
                    VerticalLayout hl = new VerticalLayout();
                    hl.addStyleName("onetomanytable");
                    hl.addStyleName("output");

                    Label l;
                    hl.addComponent(l = new Label("", ContentMode.HTML));
                    hl.addStyleName(CSS.NOPADDING);

                    hl.setCaption(ReflectionHelper.getCaption(field));

                    addComponent(container, hl, attachedActions.get(field.getName()));

                    if (allFieldContainers != null) allFieldContainers.put(field, hl);

                    JPAOneToManyFieldBuilder.bind(binder, l, field);
                } else if ((mh = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "Html")) != null) {
                    VerticalLayout hl = new VerticalLayout();
                    hl.addStyleName("collectionlinklabel");

                    Label l;
                    hl.addComponent(l = new Label("", ContentMode.HTML));
                    hl.addStyleName(CSS.NOPADDING);

                    hl.setCaption(ReflectionHelper.getCaption(field));

                    addComponent(container, hl, attachedActions.get(field.getName()));

                    if (allFieldContainers != null) allFieldContainers.put(field, hl);

                    JPAOneToManyFieldBuilder.bind(binder, l, field, mh);
                } else if (Card.class.isAssignableFrom(field.getGenericClass())) {

                    CssLayout hl = new CssLayout();
                    hl.addStyleName("collectionlinklabel");

                    hl.setCaption(ReflectionHelper.getCaption(field));

                    addComponent(container, hl, attachedActions.get(field.getName()));

                    JPAOneToManyFieldBuilder.bind(binder, hl, field, mh, true);

                    if (allFieldContainers != null) allFieldContainers.put(field, hl);

                } else {

                    Grid g = new Grid();

                    g.addStyleName("gridonetomany");
                    g.addStyleName("output");

                    String colsFilter = "";
                    if (field.isAnnotationPresent(UseTable.class)) colsFilter = field.getAnnotation(UseTable.class).fields();

                    List<FieldInterfaced> colFields = JPAOneToManyFieldBuilder.getColumnFields(field, colsFilter);

                    Class targetClass = field.getGenericClass();

                    boolean inline = false;

                    ListViewComponent.buildColumns(g, colFields, false, inline, binder, field);

                    g.setSelectionMode(attachedActions != null && attachedActions.size() > 0?Grid.SelectionMode.MULTI:Grid.SelectionMode.NONE);

                    g.setCaption(ReflectionHelper.getCaption(field));


                    int ancho = 0;
                    for (Grid.Column col : (List<Grid.Column>) g.getColumns()) ancho += col.getWidth();
                    if (ancho <= 0) ancho = 500;


                    boolean anchoCompleto = field.isAnnotationPresent(FullWidth.class) || ancho > 900;
                    anchoCompleto = false;

                    if (anchoCompleto) g.setWidth("100%");
                    else {
                        g.setWidth("" + (ancho + 60) + "px");
                    }

                    // añadimos columna para que no haga feo
                    if (anchoCompleto) {
                        if (g.getColumns().size() == 1) ((Grid.Column) g.getColumns().get(0)).setExpandRatio(1);
                        else g.addColumn((d) -> null).setWidthUndefined().setCaption("");
                    }

                    g.setHeightMode(HeightMode.UNDEFINED);


                    DataProvider dpa = (field.isAnnotationPresent(DataProvider.class)) ? field.getAnnotation(DataProvider.class) : null;

                    if (dpa == null) {

                        Method mdp = ReflectionHelper.getMethod(field.getDeclaringClass(), ReflectionHelper.getGetter(field.getName()) + "DataProvider");

                    }


                    JPAOneToManyFieldBuilder.bind(binder, g, field, targetClass, null);

                    if (allFieldContainers != null) allFieldContainers.put(field, g);

                    addComponent(container, g, attachedActions.get(field.getName()));

                }

            } else {

                Button botonLink = null;
                Label tf = new Label();
                tf.setContentMode(ContentMode.HTML);
                tf.addStyleName("outputlabel");

                if (Integer.class.equals(field.getType()) || int.class.equals(field.getType())
                        || Long.class.equals(field.getType()) || long.class.equals(field.getType())
                        || Double.class.equals(field.getType()) || double.class.equals(field.getType())
                        || FastMoney.class.equals(field.getType()) || MonetaryAmount.class.equals(field.getType())) {
                    tf.addStyleName("alinearderecha");
                }


                if (field.getType().isAnnotationPresent(Entity.class)) {

                    HorizontalLayout hl = new HorizontalLayout();
                    hl.addStyleName(CSS.NOPADDING);
                    container.addComponent(hl);
                    hl.setWidthUndefined();

                    tf.setValue("None");

                    hl.addComponent(tf);

                    if (container.getComponentCount() > 0) hl.setCaption(ReflectionHelper.getCaption(field));

                    botonLink = new Button("None");
                    botonLink.addStyleName(ValoTheme.BUTTON_LINK);
                    botonLink.addClickListener(e -> MDDUIAccessor.go(field.getName()));
                    botonLink.setVisible(false);
                    hl.addComponent(botonLink);

                    if (allFieldContainers != null) allFieldContainers.put(field, hl);

                } else {

                    container.addComponent(tf);

                    if (container.getComponentCount() > 0) tf.setCaption(ReflectionHelper.getCaption(field));

                    if (allFieldContainers != null) allFieldContainers.put(field, tf);

                }

                bind(binder, tf, botonLink, field);
                r = tf;
            }

        }

        return  r;
    }

    private void bindResourcesList(MDDBinder binder, Label l, FieldInterfaced field) {
        Binder.BindingBuilder aux = binder.forField(new HasValue() {
            @Override
            public void setValue(Object o) {
                if (o == null || ((Collection)o).size() == 0) l.setValue("Empty list");
                else {
                    try {

                        String h = "<div class='freeTexts'>";
                        for (Object i : (Collection)o) {
                            IResource l = (IResource) i;
                            h += "<div class='line'>";
                            h += "<a href='" + l.toFileLocator().getUrl() + "'>" + l.getName() + "</a>";
                            h += "</div>";
                        }
                        h += "</div>";

                        l.setValue(h);
                    } catch (Exception e) {
                        Notifier.alert(e);
                    }
                }
            }

            @Override
            public Object getValue() {
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
        });
        aux.withValidator(new BeanValidator(field.getDeclaringClass(), field.getName()));
        aux.bind(field.getName());
    }

    protected void bind(MDDBinder binder, Label tf, Button botonLink, FieldInterfaced field) {
        binder.forField(new AbstractField() {
            Object v;
            @Override
            protected void doSetValue(Object o) {
                v = o;
                if (field.isAnnotationPresent(Money.class)) o = new DecimalFormat("##,###,###,###,###,###.00").format(o != null?o:0);
                tf.setValue((o != null)?objectToString(o):"None");
                if (botonLink != null) {
                    tf.setVisible(o == null);
                    botonLink.setVisible(o != null);
                    botonLink.setCaption((o != null)?objectToString(o):"None");
                }
            }

            @Override
            public Object getValue() {
                return v;
            }
        }).bind(o -> {
            try {
                return ReflectionHelper.getValue(field, o);
            } catch (Exception e) {
                Notifier.alert(e);
                return "";
            }
        }, (o, v) -> {});
    }

    private String objectToString(Object o) {
        if (o instanceof Collection) {
            String s = "";
            for (Object x : (Collection) o) {
                if (!"".equals(s)) s += "<br/>";
                s += x.toString();
            }
            if ("".equals(s)) s += "Empty list";
            return s;
        } else {
            return o.toString();
        }
    }
}
