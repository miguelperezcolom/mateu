package io.mateu.mdd.vaadinport.vaadin.util;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.RightAlignedCol;
import io.mateu.mdd.core.annotations.UseRadioButtons;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.data.Value;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.FieldInterfacedFromType;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.EmptyRow;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.JPAOutputFieldBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilder;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.FormLayoutBuilderParameters;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.ListViewComponent;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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

        FieldInterfaced field = new FieldInterfacedFromType(Object.class, "value", new ListDataProvider(possibleValues)) {
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
        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors, FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(), null);

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
                MDD.alert("Please solve errors for all fields");
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
        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors, FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(), null);

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
        FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors, FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(), null);

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
                    MDD.alert("Key can not be empty");
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
            Class pc = ReflectionHelper.createClass("" + c.getDeclaringClass().getSimpleName() + "_" + c.getName() + "_Parameters000", ReflectionHelper.getAllFields(c), false);

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
            FormLayoutBuilder.get().build(vl, binder, model.getClass(), model, componentsToLookForErrors, FormLayoutBuilderParameters.builder().validators(validators).allFields(fields).build(), null);

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
                        MDD.alert(throwable);
                    }
                }
            });

            // Center it in the browser window
            subWindow.center();
            subWindow.setModal(true);

            subWindow.addCloseListener(e -> {
                if (evc != null) evc.setCreatorWindow(null);
                if (subWindow.getData() == null || !(subWindow.getData() instanceof Boolean) || (Boolean) subWindow.getData()) if (!okd.get()) onClose.run();
            });

            // Open it in the UI
            UI.getCurrent().addWindow(subWindow);
            if (evc != null) evc.setCreatorWindow(subWindow);

        } catch (Exception e) {
            MDD.alert(e);
            onClose.run();
        };

    }



    public static URL viewToExcel(RpcView view, Object filters, List<QuerySortOrder> sortOrders)throws Throwable {

        return listToExcel(view.rpc(filters, sortOrders, 0, Integer.MAX_VALUE));

    }

    public static Object listViewComponentToExcel(ListViewComponent listViewComponent, Object filters) throws Throwable {
        return listToExcel(listViewComponent.findAll(filters, null, 0, Integer.MAX_VALUE), listViewComponent.getColumnFields(listViewComponent.getColumnType()));
    }

    public static URL viewToPdf(RpcView view, Object filters, List<QuerySortOrder> sortOrders)throws Throwable {

        return listToPdf(view.rpc(filters, sortOrders, 0, Integer.MAX_VALUE));

    }

    public static Object listViewComponentToPdf(ListViewComponent listViewComponent, Object filters) throws Throwable {
        return listToPdf(listViewComponent.getTitle(), listViewComponent.findAll(filters, null, 0, Integer.MAX_VALUE), listViewComponent.getColumnFields(listViewComponent.getColumnType()));
    }


    public static URL queryToPdf(Query query)throws Throwable {

        return listToPdf(query.getResultList());

    }



    public static URL listToPdf(Collection list)throws Throwable {

        return listToPdf(null, list, null);

    }

    public static URL listToPdf(String title, Collection list, List<FieldInterfaced> colFields)throws Throwable {

        String[] xslfo = {""};

        Helper.notransact(em -> xslfo[0] = AppConfig.get(em).getXslfoForList());

        long t0 = new Date().getTime();


        try {


            Class rowClass =(list.size() > 0)?list.iterator().next().getClass(): EmptyRow.class;

            Document xml = new Document();
            Element arrel = new Element("root");
            xml.addContent(arrel);


            Element cab = new Element("header");
            arrel.addContent(cab);

            if (!Strings.isNullOrEmpty(title)) cab.addContent(new Element("title").setText(title));

            Element lineas = new Element("lines");
            arrel.addContent(lineas);


            if (Object[].class.equals(rowClass)) {

                List<FieldInterfaced> rowFields = (colFields != null)?colFields:getColumnFields(rowClass);


                int xx = 1;
                int pixels = 0;

                for (FieldInterfaced c : rowFields){
                    String alineado = "left";
                    Element aux = new Element("column");
                    cab.addContent(aux);
                    aux.setAttribute("label", ReflectionHelper.getCaption(c));
                    double ancho = ListViewComponent.getColumnWidth(c);
                    aux.setAttribute("width", "" +  ancho / 1.5);

                    if (Integer.class.equals(c.getType()) || int.class.equals(c.getType())
                            || Long.class.equals(c.getType()) || long.class.equals(c.getType())
                            || Double.class.equals(c.getType()) || double.class.equals(c.getType())
                            || BigInteger.class.equals(c.getType()) || BigDecimal.class.equals(c.getType()) || Number.class.equals(c.getType())
                            || FastMoney.class.equals(c.getType()) || MonetaryAmount.class.equals(c.getType())
                            || c.isAnnotationPresent(RightAlignedCol.class)
                    ) {
                        alineado = "right";
                    }

                    aux.setAttribute("align", alineado);
                    pixels += ancho;
                }

                String ancho = "21cm";
                String alto = "29.7cm";
                if (pixels > 750){
                    alto = "21cm";
                    ancho = "29.7cm";
                }
                arrel.setAttribute("width", ancho);
                arrel.setAttribute("height", alto);

                for (Object x : list){

                    Element linea = new Element("line");
                    lineas.addContent(linea);

                    int col = 1;
                    for (FieldInterfaced c : rowFields){

                        Element cell = new Element("cell");
                        linea.addContent(cell);
                        Object[] a = (Object[]) x;
                        Object v = a.length > col?a[col++]:null;
                        String text = "";
                        if (v != null) text += v;
                        if (v instanceof Double){
                            DecimalFormat dfm = new DecimalFormat("#0.00");
                            text = dfm.format(((Double)v));
                        }
                        cell.setText(text);

                    }

                }

            } else {

                List<FieldInterfaced> rowFields = getColumnFields(rowClass);


                int xx = 1;
                int pixels = 0;

                for (FieldInterfaced c : rowFields){
                    String alineado = "left";
                    Element aux = new Element("column");
                    cab.addContent(aux);
                    aux.setAttribute("label", ReflectionHelper.getCaption(c));
                    double ancho = ListViewComponent.getColumnWidth(c);
                    aux.setAttribute("width", "" +  ancho / 1.5);

                    if (Integer.class.equals(c.getType()) || int.class.equals(c.getType())
                            || Long.class.equals(c.getType()) || long.class.equals(c.getType())
                            || Double.class.equals(c.getType()) || double.class.equals(c.getType())
                            || BigInteger.class.equals(c.getType()) || BigDecimal.class.equals(c.getType()) || Number.class.equals(c.getType())
                            || FastMoney.class.equals(c.getType()) || MonetaryAmount.class.equals(c.getType())
                            || c.isAnnotationPresent(RightAlignedCol.class)
                    ) {
                        alineado = "right";
                    }

                    aux.setAttribute("align", alineado);
                    pixels += ancho;
                }

                String ancho = "21cm";
                String alto = "29.7cm";
                if (pixels > 750){
                    alto = "21cm";
                    ancho = "29.7cm";
                }
                arrel.setAttribute("width", ancho);
                arrel.setAttribute("height", alto);

                for (Object x : list){

                    Element linea = new Element("line");
                    lineas.addContent(linea);

                    for (FieldInterfaced c : rowFields){

                        Element cell = new Element("cell");
                        linea.addContent(cell);
                        Object v = ReflectionHelper.getValue(c, x);
                        String text = "";
                        if (v != null) text += v;
                        if (v instanceof Double){
                            DecimalFormat dfm = new DecimalFormat("#0.00");
                            text = dfm.format(((Double)v));
                        }
                        cell.setText(text);

                    }

                }

            }


            if (list.size() >= 5000) {
                Element linea = new Element("line");
                lineas.addContent(linea);

                Element txt = new Element("cell");
                linea.addContent(txt);

                txt.setText("HAY MAS DE 5000 LINEAS. CONTACTA CON EL DEPARTAMENTO DE DESARROLLO SI QUIERES EL EXCEL COMPLETO...");
            }

            try {
                String archivo = UUID.randomUUID().toString();

                File temp = (System.getProperty("tmpdir") == null)?File.createTempFile(archivo, ".pdf"):new File(new File(System.getProperty("tmpdir")), archivo + ".pdf");


                log.debug("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
                log.debug("Temp file : " + temp.getAbsolutePath());

                FileOutputStream fileOut = new FileOutputStream(temp);
                String sxml = new XMLOutputter(Format.getPrettyFormat()).outputString(xml);
                log.debug("xslfo=" + xslfo);
                log.debug("xml=" + sxml);
                fileOut.write(Helper.fop(new StreamSource(new StringReader(xslfo[0])), new StreamSource(new StringReader(sxml))));
                fileOut.close();

                String baseUrl = System.getProperty("tmpurl");
                if (baseUrl == null) {
                    return temp.toURI().toURL();
                }
                return new URL(baseUrl + "/" + temp.getName());

            } catch (IOException e) {
                e.printStackTrace();
            }


        } catch (Exception e1) {
            e1.printStackTrace();
        }


        return null;
    }

    private static List<FieldInterfaced> getColumnFields(Class rowClass) {
        List<FieldInterfaced> cols = ListViewComponent.getColumnFields(rowClass);

        return cols;
    }




    public static URL queryToExcel(Query query)throws Throwable {

        return listToExcel(query.getResultList());

    }


    public static URL listToExcel(Collection list)throws Throwable {

        return listToExcel(list, null);

    }

    public static URL listToExcel(Collection list, List<FieldInterfaced> colFields)throws Throwable {

        long t0 = new Date().getTime();


        try {

            File temp = writeExcel(list, colFields);

            String baseUrl = System.getProperty("tmpurl");
            if (baseUrl == null) {
                return temp.toURI().toURL();
            }
            return new URL(baseUrl + "/" + temp.getName());

        } catch (Exception e1) {
            e1.printStackTrace();
        }


        return null;

    }

    public static File writeExcel(Collection data, List<FieldInterfaced> colFields) throws IOException, InvalidFormatException {
        String archivo = UUID.randomUUID().toString();

        File temp = (System.getProperty("tmpdir") == null)?File.createTempFile(archivo, ".xlsx"):new File(new File(System.getProperty("tmpdir")), archivo + ".xlsx");


        log.debug("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
        log.debug("Temp file : " + temp.getAbsolutePath());

        Workbook wb = new XSSFWorkbook();
        CreationHelper createHelper = wb.getCreationHelper();
        Sheet sheet = wb.createSheet();
        int posfila = 0;
        for (Iterator i = data.iterator(); i.hasNext(); posfila++) {
            Object l2 = i.next();
            Row row = sheet.createRow(posfila);
            for (int poscol = 0; poscol < colFields.size(); poscol++) {
                Cell cell = row.createCell(poscol);

                Object v = null;
                try {
                    v = (l2 instanceof Object[])?((Object[])l2)[poscol + 1]:ReflectionHelper.getValue(colFields.get(poscol), l2);

                    Helper.fillCell(wb, createHelper, cell, v);
                } catch (Exception e) {
                    e.printStackTrace();
                }


            }
        }
        //wb.close();

        FileOutputStream fileOut = new FileOutputStream(temp);
        wb.write(fileOut);
        fileOut.close();

        return temp;
    }

}
