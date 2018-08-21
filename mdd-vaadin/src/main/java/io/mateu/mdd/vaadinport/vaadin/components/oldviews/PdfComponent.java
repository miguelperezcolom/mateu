package io.mateu.mdd.vaadinport.vaadin.components.oldviews;


import ar.com.fdvs.dj.core.DynamicJasperHelper;
import ar.com.fdvs.dj.core.layout.ClassicLayoutManager;
import ar.com.fdvs.dj.domain.DynamicReport;
import ar.com.fdvs.dj.domain.builders.FastReportBuilder;
import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Link;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.tests.Persona;
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.view.JasperViewer;

import javax.persistence.Query;
import javax.xml.transform.Source;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

public class PdfComponent extends VerticalLayout {


    public PdfComponent(Source xsl, Source xml) {

    }

    public PdfComponent(List list) throws Throwable {

        addComponent(new Link("Click me to view the pdf", new ExternalResource(build(list))));

    }

    public PdfComponent(Query query) throws Throwable {

        addComponent(new Link("Click me to view the pdf", new ExternalResource(build(query))));

    }


    public PdfComponent(RpcView view, Object filters) throws Throwable {

        addComponent(new Link("Click me to view the pdf", new ExternalResource(build(view, filters))));

    }

    private URL build(RpcView view, Object filters) throws Throwable {

        return Helper.viewToPdf(view, filters);

    }


    public static URL build(Query query) throws Throwable {

        return Helper.queryToPdf(query);

    }


    public static URL build(List list) throws Throwable {

        return Helper.listToPdf(list);

    }

}
