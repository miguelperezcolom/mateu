package io.mateu.mdd.vaadinport.vaadin.components.oldviews;


import ar.com.fdvs.dj.core.DynamicJasperHelper;
import ar.com.fdvs.dj.core.layout.ClassicLayoutManager;
import ar.com.fdvs.dj.domain.DynamicReport;
import ar.com.fdvs.dj.domain.builders.FastReportBuilder;
import com.vaadin.ui.Link;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.vaadinport.vaadin.tests.Persona;
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.view.JasperViewer;

import javax.persistence.Query;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

public class JasperReportComponent extends VerticalLayout {


    public JasperReportComponent(JRDataSource dataSource) {

    }

    public JasperReportComponent(Query query) {

        addComponent(new Link("Report", null));

    }


    public static void build(Query query) throws Throwable {

                /*
        FastReportBuilder drb = new FastReportBuilder();
        DynamicReport dr = drb

                .addColumn("State", "state", String.class.getName(),30)
                .addColumn("Branch", "branch", String.class.getName(),30)
                .addColumn("Product Line", "productLine", String.class.getName(),50)
                .addColumn("Item", "item", String.class.getName(),50)
                .addColumn("Item Code", "id", Long.class.getName(),30,true)
                .addColumn("Quantity", "quantity", Long.class.getName(),60,true)
                .addColumn("Amount", "amount", Float.class.getName(),70,true)
                .addGroups(2)

                .setTitle("November 2006 sales report")
                .setSubtitle("This report was generated at " + new Date())
                .setPrintBackgroundOnOddRows(true)
                .setUseFullPageWidth(true)
                .build();

        JRDataSource ds = new JRBeanCollectionDataSource(toList(query));
        JasperPrint jp = DynamicJasperHelper.generateJasperPrint(dr, new ClassicLayoutManager(), ds);
        JasperViewer.viewReport(jp);    //finally display the report report

*/

    }

    private static Collection toList(Query query) throws Throwable {
        return query.getResultList();
    }

    public static void main(String[] args) throws Throwable {

        System.setProperty("appconf", "/home/miguel/work/appconf.properties");



        FastReportBuilder drb = new FastReportBuilder();

        for (FieldInterfaced f : ReflectionHelper.getAllFields(Persona.class)) {
            drb = drb.addColumn(ReflectionHelper.getCaption(f), f.getName(), getTipo(f.getType()), 120);
        }

        DynamicReport dr = drb

                /*
                .addColumn("State", "state", String.class.getName(),30)
                .addColumn("Branch", "branch", String.class.getName(),30)
                .addColumn("Product Line", "productLine", String.class.getName(),50)
                .addColumn("Item", "item", String.class.getName(),50)
                .addColumn("Item Code", "id", Long.class.getName(),30,true)
                .addColumn("Quantity", "quantity", Long.class.getName(),60,true)
                .addColumn("Amount", "amount", Float.class.getName(),70,true)
                .addGroups(2)

                */


                .setTitle("November 2006 sales report")
                .setSubtitle("This report was generated at " + new Date())
                .setPrintBackgroundOnOddRows(true)
                .setUseFullPageWidth(true)
                .build();

        JRDataSource ds = new JRBeanCollectionDataSource(createDummyCollection());
        JasperPrint jp = DynamicJasperHelper.generateJasperPrint(dr, new ClassicLayoutManager(), ds);
        JasperViewer.viewReport(jp);




        /*

        JasperReportBuilder report = DynamicReports.report();

        report.title(Components.text("Título").setHorizontalTextAlignment(HorizontalTextAlignment.CENTER));
        report.pageFooter(Components.pageXofY());//show page number on the page footer

        report.setDataSource(createDummyCollection());


        report.toPdf(new FileOutputStream("/home/miguel/work/xxx.pdf"));

        */


    }

    private static Class getTipo(Class<?> type) {
        if (int.class.equals(type)) {
            return Integer.class;
        } else return type;
    }

    private static Collection<Persona> createDummyCollection() {
        List<Persona> l = new ArrayList<>();

        l.add(new Persona("Mateu", "Pérez", 10));
        l.add(new Persona("Antonia", "Galmés", 42));

        return l;
    }

}
