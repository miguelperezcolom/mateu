package io.mateu.mdd.vaadinport.vaadin.components.views;


import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.server.ExternalResource;
import com.vaadin.ui.Link;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.vaadinport.vaadin.util.VaadinHelper;

import javax.persistence.Query;
import javax.xml.transform.Source;
import java.net.URL;
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


    public PdfComponent(RpcView view, Object filters, List<QuerySortOrder> sortOrders) throws Throwable {

        addComponent(new Link("Click me to view the pdf", new ExternalResource(build(view, filters, sortOrders))));

    }

    private URL build(RpcView view, Object filters, List<QuerySortOrder> sortOrders) throws Throwable {

        return VaadinHelper.viewToPdf(view, filters, sortOrders);

    }


    public static URL build(Query query) throws Throwable {

        return VaadinHelper.queryToPdf(query);

    }


    public static URL build(List list) throws Throwable {

        return VaadinHelper.listToPdf(list);

    }

}
