package io.mateu.mdd.demofrontoffice.ui.common;

import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioLine;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import java.util.Collection;

/**
 * The check-in domain lifecycle, shared by the wizard's completion action and the Reserva 360's
 * direct path: when the reservation already has everything the wizard would ask for, the 360
 * checks the stay in without opening the wizard.
 */
public final class CheckInFlow {

  private CheckInFlow() {}

  /**
   * No wizard step would apply — pax registered, a room assigned and the ancillaries selection
   * closed — so confirming needs no questions.
   */
  public static boolean listoParaCheckInDirecto(Stay stay) {
    return Paxes.paxPendientes(stay) == 0
        && habitacionAsignada(stay)
        && FrontOffice.checkInOps().of(stay.id()).extras();
  }

  /** An assigned room completes the room task — inspection is housekeeping detail, not a gate. */
  public static boolean habitacionAsignada(Stay stay) {
    return stay.roomNumber() != null && !stay.roomNumber().isBlank();
  }

  /** The selected room's type from the room inventory, falling back to the reservation's. */
  public static String roomTypeOf(String roomNumber, String fallback) {
    return FrontOffice.rooms()
        .findByNumber(roomNumber)
        .map(r -> r.type() != null ? r.type() : "Planta " + r.floor())
        .orElse(fallback);
  }

  /**
   * Assign the room, check the stay in, occupy the room and open the folio with the accommodation
   * and add-on charges. A null {@code roomNumber} keeps the reservation's room.
   */
  public static Stay completar(String stayId, String roomNumber, Collection<String> addOnIds) {
    var view = FrontOffice.stayView(stayId);
    var stay = view.stay();
    if (stay.status() == StayStatus.ARRIVING) {
      var selected = roomNumber != null ? roomNumber : stay.roomNumber();
      stay = stay.assignRoom(selected, roomTypeOf(selected, stay.roomType()));
      for (var addOnId : addOnIds) {
        stay = stay.addAddOn(addOnId);
      }
      stay = FrontOffice.stays().save(stay.completeCheckIn());
      FrontOffice.rooms()
          .findByNumber(selected)
          .filter(room -> room.assignable())
          .ifPresent(room -> FrontOffice.rooms().save(room.occupy()));
      if (view.folio() == null) {
        var folio =
            Folio.openFor("f-" + stay.id(), stay.id(), stay.total())
                .post(FolioLine.charge("Alojamiento x" + stay.nights() + " noches", stay.total()));
        for (var addOn : stay.addOns()) {
          var item = FrontOffice.addOnCatalog().findById(addOn.addOnId()).orElse(null);
          if (item != null && item.price() != null) {
            folio = folio.post(FolioLine.charge(item.title(), item.price()));
          }
        }
        FrontOffice.folios().save(folio);
      }
    }
    // la selección de ancillaries queda cerrada con el check-in (operación "extras")
    FrontOffice.checkInOps().save(stayId, FrontOffice.checkInOps().of(stayId).withExtras(true));
    return stay;
  }
}
