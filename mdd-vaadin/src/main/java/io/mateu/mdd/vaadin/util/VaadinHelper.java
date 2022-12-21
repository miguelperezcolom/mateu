package io.mateu.mdd.vaadin.util;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.shared.FormLayoutBuilderParameters;
import io.mateu.mdd.shared.annotations.RightAlignedCol;
import io.mateu.mdd.shared.annotations.UseRadioButtons;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.fieldBuilders.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadin.components.views.EditorViewComponent;
import io.mateu.mdd.vaadin.components.views.FormLayoutBuilder;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.FieldInterfacedFromType;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.common.EmptyRow;
import io.mateu.util.data.Value;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;
import org.javamoney.moneta.FastMoney;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;

import javax.money.MonetaryAmount;
import javax.persistence.Query;
import javax.xml.transform.stream.StreamSource;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.lang.annotation.Annotation;
import java.lang.reflect.Constructor;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.net.URL;
import java.text.DecimalFormat;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

@Slf4j
public class VaadinHelper {

    public static void choose(String caption, Set possibleValues, Consumer onOk, Runnable onClose) {

        FieldInterfaced field = new FieldInterfacedFromType(Object.class, "value",
                new ListDataProvider(possibleValues)) {
            @Override
            public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
                if (UseRadioButtons.class.equals(annotationClass) && possibleValues.size() < 15) return true;
                else return super.isAnnotationPresent(annotationClass);
            }

            @Override
            public boolean forceInput() {
                return true;
            }
        };

        List<FieldInterfaced> fields = Lists.newArrayList(field);

        MDDBinder binder = new MDDBinder(fields);


        // Create a sub-window and set the content
        Window subWindow = new Window(caption);
        VerticalLayout subContent = new VerticalLayout();
        subWindow.setContent(subContent);


        VerticalLayout vl = new VerticalLayout();

        Map<String, Object> model = new HashMap<>();
        binder.setBean(model);

        Map<HasValue, List<Validator>> validators = new HashMap<>();

        List<Component> componentsToLookForErrors = new ArrayList<>();
        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors,
                FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(),
                null);

        // Put some components in it
        subContent.addComponent(vl);
        Button b;
        subContent.addComponent(b = new Button("OK"));

        Value<Boolean> okd = new Value<>(false);

        b.addClickListener(e -> {
            if (validate(componentsToLookForErrors)) {
                Object v = ((Map<String, Object>)binder.getBean()).get("value");
                onOk.accept(v);
                okd.set(true);
                subWindow.close();
            }
        });

        // Center it in the browser window
        subWindow.center();
        subWindow.setModal(true);

        subWindow.addCloseListener(e -> {
            if (!okd.get()) onClose.run();
        });

        // Open it in the UI
        UI.getCurrent().addWindow(subWindow);


    }

    private static boolean validate(List<Component> componentsToLookForErrors) {
        boolean noerror = true;
        for (Component c : componentsToLookForErrors) {
            if (c instanceof AbstractComponent && ((AbstractComponent) c).getComponentError() != null) {
                noerror = false;
                Notifier.alert("Please solve errors for all fields");
                break;
            }
        }
        return noerror;
    }


    public static <T> void getValue(String caption, Class<T> type, Consumer<T> f) {

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();
        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        FieldInterfaced field = new FieldInterfacedFromType(type, "value");

        List<FieldInterfaced> fields = Lists.newArrayList(field);

        MDDBinder binder = new MDDBinder(fields);


        // Create a sub-window and set the content
        Window subWindow = new Window(caption);
        VerticalLayout subContent = new VerticalLayout();
        subWindow.setContent(subContent);


        VerticalLayout vl = new VerticalLayout();

        Map<String, Object> model = new HashMap<>();
        binder.setBean(model);

        Map<HasValue, List<Validator>> validators = new HashMap<>();

        List<Component> componentsToLookForErrors = new ArrayList<>();
        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors,
                FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(),
                null);

        // Put some components in it
        subContent.addComponent(vl);
        Button b;
        subContent.addComponent(b = new Button("OK"));

        b.addClickListener(e -> {
            if (validate(componentsToLookForErrors)) {
                Object v = ((Map<String, Object>) binder.getBean()).get("value");
                f.accept((T) v);
                subWindow.close();
            }
        });

        // Center it in the browser window
        subWindow.center();
        subWindow.setModal(true);

        // Open it in the UI
        UI.getCurrent().addWindow(subWindow);


    }


    public static <K, V> void getPair(String caption, Class<K> keyType, Class<V> valueType, BiConsumer<K, V> f) {

        Map<FieldInterfaced, Component> allFieldContainers = new HashMap<>();
        JPAOutputFieldBuilder ofb = new JPAOutputFieldBuilder();

        FieldInterfaced keyField = new FieldInterfacedFromType(keyType, "key");
        FieldInterfaced valueField = new FieldInterfacedFromType(valueType, "value");

        List<FieldInterfaced> fields = Lists.newArrayList(keyField, valueField);

        MDDBinder binder = new MDDBinder(fields);


        // Create a sub-window and set the content
        Window subWindow = new Window(caption);
        VerticalLayout subContent = new VerticalLayout();
        subWindow.setContent(subContent);


        VerticalLayout vl = new VerticalLayout();

        Map<String, Object> model = new HashMap<>();
        binder.setBean(model);

        Map<HasValue, List<Validator>> validators = new HashMap<>();

        List<Component> componentsToLookForErrors = new ArrayList<>();
        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors,
                FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(),
                null);

        // Put some components in it
        subContent.addComponent(vl);
        Button b;
        subContent.addComponent(b = new Button("OK"));

        b.addClickListener(e -> {
            if (validate(componentsToLookForErrors)) {
                Map<String, Object> bean = (Map<String, Object>) binder.getBean();
                Object k = bean.get("key");
                Object v = bean.get("value");
                if (k != null) {
                    f.accept((K) k, (V) v);
                    subWindow.close();
                } else {
                    Notifier.alert("Key can not be empty");
                }
            }
        });

        // Center it in the browser window
        subWindow.center();
        subWindow.setModal(true);

        // Open it in the UI
        UI.getCurrent().addWindow(subWindow);


    }

    public static void fill(String caption, Constructor c, Consumer onOk, Runnable onClose) {
        fill(null, caption, c, onOk, onClose);
    }


    public static void fill(EditorViewComponent evc, String caption, Constructor c, Consumer onOk, Runnable onClose) {
        try {
            Class pc = ReflectionHelper.createClass(MDD.getClassPool(), MDDBinder.class,
                    MDD.getClassPool().getClassLoader(),
                    "" + c.getDeclaringClass().getSimpleName() + "_" + c.getName() + "_Parameters000",
                    ReflectionHelper.getAllFields(c), false);

            List<FieldInterfaced> fields = ReflectionHelper.getAllFields(pc);

            MDDBinder binder = new MDDBinder(pc);

            // Create a sub-window and set the content
            BindedWindow subWindow = new BindedWindow(caption) {
                @Override
                public MDDBinder getBinder() {
                    return binder;
                }
            };
            VerticalLayout subContent = new VerticalLayout();
            subWindow.setContent(subContent);


            VerticalLayout vl = new VerticalLayout();

            Object model = pc.newInstance();

            binder.setBean(model);

            Map<HasValue, List<Validator>> validators = new HashMap<>();

            List<Component> componentsToLookForErrors = new ArrayList<>();
            FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors,
                    FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(),
                    null);

            // Put some components in it
            subContent.addComponent(vl);
            Button b;
            subContent.addComponent(b = new Button("OK"));

            Value<Boolean> okd = new Value<>(false);

            b.addClickListener(e -> {
                if (validate(componentsToLookForErrors)) {
                    Object v = null;
                    try {
                        v = ReflectionHelper.newInstance(c, binder.getBean());
                        onOk.accept(v);
                        okd.set(true);
                        subWindow.close();
                    } catch (Throwable throwable) {
                        Notifier.alert(throwable);
                    }
                }
            });

            // Center it in the browser window
            subWindow.center();
            subWindow.setModal(true);

            subWindow.addCloseListener(e -> {
                if (evc != null) evc.setCreatorWindow(null);
                if (subWindow.getData() == null || !(subWindow.getData() instanceof Boolean)
                        || (Boolean) subWindow.getData()) if (!okd.get()) onClose.run();
            });

            // Open it in the UI
            UI.getCurrent().addWindow(subWindow);
            if (evc != null) evc.setCreatorWindow(subWindow);

        } catch (Exception e) {
            Notifier.alert(e);
            onClose.run();
        };

    }





    public static void saveOrDiscard(String msg, EditorViewComponent editor, Runnable afterSave) {
        Window w = new Window("Please confirm action");

        VerticalLayout l = new VerticalLayout();

        l.addComponent(new Label(msg));

        Button buttonSaveBefore;
        Button buttonYes;
        Button buttonNo;
        HorizontalLayout hl;
        l.addComponent(hl = new HorizontalLayout(buttonSaveBefore = new Button("Save and proceed", e -> {
            try {
                if (editor.validate()) {
                    editor.save(false);
                    afterSave.run();
                }
            } catch (Throwable t) {
                Notifier.alert(t);
            }
            w.close();
        }), buttonYes = new Button("Exit and discard changes", e -> {
            try {
                afterSave.run();
            } catch (Throwable t) {
                Notifier.alert(t);
            }
            w.close();
        })
                , buttonNo = new Button("Abort and stay here", e -> w.close())
        ));

        hl.setDefaultComponentAlignment(Alignment.MIDDLE_RIGHT);

        buttonSaveBefore.addStyleName(ValoTheme.BUTTON_FRIENDLY);
        //buttonNo.addStyleName(ValoTheme.BUTTON_PRIMARY);
        buttonYes.addStyleName(ValoTheme.BUTTON_DANGER);


        w.setContent(l);

        w.center();
        w.setModal(true);

        UI.getCurrent().addWindow(w);
    }



    public static void confirm(String msg, Runnable onOk) {

        Window w = new Window("Please confirm action");

        VerticalLayout l = new VerticalLayout();

        l.addComponent(new Label(msg));

        Button buttonYes;
        Button buttonNo;
        HorizontalLayout hl;
        l.addComponent(hl = new HorizontalLayout(buttonYes = new Button("Yes, do it", e -> {
            try {
                onOk.run();
            } catch (Throwable t) {
                Notifier.alert(t);
            }
            w.close();
        }), buttonNo = new Button("No, thanks", e -> {
            w.close();
        })));

        hl.setDefaultComponentAlignment(Alignment.MIDDLE_RIGHT);

        buttonNo.addStyleName(ValoTheme.BUTTON_FRIENDLY);
        buttonYes.addStyleName(ValoTheme.BUTTON_DANGER);


        w.setContent(l);

        w.center();
        w.setModal(true);

        UI.getCurrent().addWindow(w);

    }
}
