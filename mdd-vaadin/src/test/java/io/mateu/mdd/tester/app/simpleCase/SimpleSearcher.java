package io.mateu.mdd.tester.app.simpleCase;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.core.app.Searcher;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.Found;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter@Slf4j
public class SimpleSearcher extends Searcher {

    private String bookingRef;

    private String invoiceNumber;


    public List<Found> findByBookingRef(String text) {
        long t0 = System.currentTimeMillis();

        List<Found> found = new ArrayList<>();

        found.add(new Found("dggdgd/hdhdh/ydydy", "Reserva 654646", "3 personas del 12/03 al 15/06, en media pensión, en Hotel Argos"));

        log.debug("Search of " + text + " took " + (System.currentTimeMillis() - t0) + "ms.");

        return found;

    }


    public List<Found> findByInvoiceNumber(String text) {
        long t0 = System.currentTimeMillis();

        List<Found> found = new ArrayList<>();

        found.add(new Found("dggdgd/hdhdh/ydydy", "Factura 546564", "factura emitida el 05/03/2018, por 12.555,00 euros, que vence el 06/07/2019"));

        log.debug("Search of " + text + " took " + (System.currentTimeMillis() - t0) + "ms.");

        return found;

    }

}
