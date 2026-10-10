package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.RowStatus;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Reservation search (OPERA Cloud 26.3 user guide, 001 "Using Advanced Search" and "Modifying
 * Column Selection and Sequence"; 003 search results): the result list with its rows toned by
 * status (due out = warning, VIP arriving = info, cancelled = danger), the column chooser, saved
 * views and the CSV / Excel export (EXT in OPERA).
 */
@UI("/reservations")
@Title("Reservations")
public class ReservationSearch extends AutoCrud<ReservationSearch.ReservationRecord> {

  public enum Tone {
    success,
    warning,
    danger,
    info,
    neutral
  }

  public record ReservationRecord(
      @ReadOnly String id,
      String confirmation,
      String guest,
      String room,
      LocalDate arrival,
      LocalDate departure,
      int nights,
      String rateCode,
      BigDecimal rate,
      Hotel.ReservationStatus status,
      String company,
      @HiddenInList @RowStatus Tone tone)
      implements Identifiable {}

  static ReservationRecord recordOf(Hotel.Reservation r) {
    Tone tone =
        r.status == Hotel.ReservationStatus.CANCELLED
            ? Tone.danger
            : r.status == Hotel.ReservationStatus.DUE_OUT
                ? Tone.warning
                : r.vip && r.status == Hotel.ReservationStatus.DUE_IN ? Tone.info : null;
    return new ReservationRecord(
        r.id,
        r.confirmation,
        r.guest + (r.vip ? " ★" : ""),
        r.room,
        r.arrival,
        r.departure,
        r.nights(),
        r.rateCode,
        r.rate,
        r.status,
        r.company,
        tone);
  }

  @Override
  public GridLayout gridLayout() {
    return GridLayout.table;
  }

  @Override
  public boolean csvExportable() {
    return true;
  }

  @Override
  public boolean excelExportable() {
    return true;
  }

  @Override
  public CrudStore<ReservationRecord> store() {
    return new CrudStore<>() {
      @Override
      public Optional<ReservationRecord> findById(String id) {
        return Hotel.reservation(id).map(ReservationSearch::recordOf);
      }

      @Override
      public String save(ReservationRecord entity) {
        return entity.id();
      }

      @Override
      public List<ReservationRecord> findAll() {
        return Hotel.RESERVATIONS.stream()
            .sorted((a, b) -> a.arrival.compareTo(b.arrival))
            .map(ReservationSearch::recordOf)
            .toList();
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        Hotel.RESERVATIONS.stream()
            .filter(r -> selectedIds.contains(r.id))
            .forEach(r -> r.status = Hotel.ReservationStatus.CANCELLED);
      }
    };
  }
}
