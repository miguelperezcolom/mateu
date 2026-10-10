package io.mateu.mdd.demovbpms.infra.in.ui.financials;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Aggregate;
import io.mateu.uidl.annotations.GroupBy;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * The folio, summarized (OPERA Cloud 26.3 user guide, 006 "About Billing": each window has a
 * Detailed / Summarized toggle; summarized groups by transaction code with tax separate): charges
 * of an in-house guest grouped by code, subtotals per code and the folio total.
 */
@UI("/folio-charges")
@Title("Folio · summarized")
public class FolioCharges extends AutoCrud<FolioCharges.ChargeRow> {

  public record ChargeRow(
      @ReadOnly String id,
      @GroupBy String code,
      String description,
      LocalDate date,
      int window,
      @Aggregate(AggregateFunction.sum) BigDecimal amount,
      @Aggregate(AggregateFunction.sum) BigDecimal tax)
      implements Identifiable {}

  static String reservationId() {
    return Hotel.RESERVATIONS.stream()
        .filter(r -> r.status == Hotel.ReservationStatus.IN_HOUSE && !Hotel.chargesOf(r.id).isEmpty())
        .findFirst()
        .map(r -> r.id)
        .orElse("");
  }

  @Override
  public GridLayout gridLayout() {
    return GridLayout.table;
  }

  @Override
  public CrudStore<ChargeRow> store() {
    return new CrudStore<>() {
      @Override
      public Optional<ChargeRow> findById(String id) {
        return findAll().stream().filter(c -> c.id().equals(id)).findFirst();
      }

      @Override
      public String save(ChargeRow entity) {
        return entity.id();
      }

      @Override
      public List<ChargeRow> findAll() {
        return Hotel.chargesOf(reservationId()).stream()
            .map(
                c ->
                    new ChargeRow(
                        c.id(), c.code() + " · " + c.description(), c.description(), c.date(),
                        c.window(), c.amount(), c.tax()))
            .toList();
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }
}
