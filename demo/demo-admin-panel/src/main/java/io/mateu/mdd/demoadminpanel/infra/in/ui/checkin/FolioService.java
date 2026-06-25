package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Application service for the folio / deposit operations triggered from the
 * "Folios / Anticipos" section of the check-in screen.
 */
@Service
public class FolioService {

    private final ReservationLineRepository reservations;

    public FolioService(ReservationLineRepository reservations) {
        this.reservations = reservations;
    }

    /** Best-effort conversion of a value coming from the wire (Number or String) to BigDecimal. */
    public static BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof BigDecimal bd) {
            return bd;
        }
        if (value instanceof Number n) {
            return BigDecimal.valueOf(n.doubleValue());
        }
        var s = value.toString().trim().replace(",", ".");
        if (s.isEmpty()) {
            return null;
        }
        try {
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** Use case: change the credit limit of a reservation. */
    public void setCreditLimit(String reservationId, BigDecimal limit) {
        reservations.findById(reservationId).ifPresent(line -> {
            line.setCreditLimit(limit);
            reservations.save(line);
        });
    }

    /**
     * Use case: register a charge (cobro) on a reservation. The amount is added to the deposit
     * ("entrega a cuenta") and subtracted from the outstanding balance ("saldo pendiente"),
     * which never goes below zero.
     */
    public void addCharge(String reservationId, BigDecimal amount) {
        if (amount == null) {
            return;
        }
        reservations.findById(reservationId).ifPresent(line -> {
            var deposit = line.getDeposit() != null ? line.getDeposit() : BigDecimal.ZERO;
            var balance = line.getSaldoPendiente() != null ? line.getSaldoPendiente() : BigDecimal.ZERO;
            line.setDeposit(deposit.add(amount));
            line.setSaldoPendiente(balance.subtract(amount).max(BigDecimal.ZERO));
            reservations.save(line);
        });
    }
}
