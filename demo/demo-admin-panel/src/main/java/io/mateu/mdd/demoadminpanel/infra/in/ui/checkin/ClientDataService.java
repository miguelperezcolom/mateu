package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import org.springframework.stereotype.Service;

/**
 * Application service for the client-data operations triggered from the "Información cliente"
 * section of the check-in screen.
 */
@Service
public class ClientDataService {

    private final ReservationLineRepository reservations;

    public ClientDataService(ReservationLineRepository reservations) {
        this.reservations = reservations;
    }

    /** Use case: update the company / billing data of a reservation. */
    public void updateCompany(String reservationId, String companyName, String cif,
                              String billingEmail, String fiscalAddress, String paymentTerms) {
        reservations.findById(reservationId).ifPresent(line -> {
            line.setCompanyName(companyName);
            line.setCif(cif);
            line.setBillingEmail(billingEmail);
            line.setFiscalAddress(fiscalAddress);
            line.setPaymentTerms(paymentTerms);
            reservations.save(line);
        });
    }
}
