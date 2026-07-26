package io.mateu.mdd.demofrontoffice.ui.common;

import io.mateu.mdd.demofrontoffice.domain.automation.AutomationRepository;
import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogRepository;
import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogRepository;
import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioRepository;
import io.mateu.mdd.demofrontoffice.domain.guest.Guest;
import io.mateu.mdd.demofrontoffice.domain.guest.GuestRepository;
import io.mateu.mdd.demofrontoffice.domain.room.RoomRepository;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayRepository;
import org.springframework.stereotype.Component;

/**
 * Static gateway from the view models to the domain ports. Mateu builds screens, wizard steps and
 * {@code Callable<Component>} holders reflectively (no constructor injection there), so this bean
 * captures the repositories at startup and exposes them statically — the same pattern the old
 * {@code HotelData} fixtures used.
 */
@Component
public class FrontOffice {

  private static FrontOffice instance;

  private final GuestRepository guests;
  private final StayRepository stays;
  private final FolioRepository folios;
  private final RoomRepository rooms;
  private final AutomationRepository automations;
  private final ChargeCatalogRepository chargeCatalog;
  private final AddOnCatalogRepository addOnCatalog;

  public FrontOffice(
      GuestRepository guests,
      StayRepository stays,
      FolioRepository folios,
      RoomRepository rooms,
      AutomationRepository automations,
      ChargeCatalogRepository chargeCatalog,
      AddOnCatalogRepository addOnCatalog) {
    this.guests = guests;
    this.stays = stays;
    this.folios = folios;
    this.rooms = rooms;
    this.automations = automations;
    this.chargeCatalog = chargeCatalog;
    this.addOnCatalog = addOnCatalog;
    instance = this;
  }

  public static GuestRepository guests() {
    return instance.guests;
  }

  public static StayRepository stays() {
    return instance.stays;
  }

  public static FolioRepository folios() {
    return instance.folios;
  }

  public static RoomRepository rooms() {
    return instance.rooms;
  }

  public static AutomationRepository automations() {
    return instance.automations;
  }

  public static ChargeCatalogRepository chargeCatalog() {
    return instance.chargeCatalog;
  }

  public static AddOnCatalogRepository addOnCatalog() {
    return instance.addOnCatalog;
  }

  /** A stay with its guest and folio — the working unit of every front-office screen. */
  public record StayView(Stay stay, Guest guest, Folio folio) {}

  /**
   * Loads the stay + guest + folio behind a screen route. Falls back to the first stay when the
   * route carries a stale/unknown id, mirroring the old fixtures' behavior.
   */
  public static StayView stayView(String stayId) {
    Stay stay =
        stays()
            .findById(stayId == null ? "" : stayId)
            .orElseGet(() -> stays().findAll().stream().findFirst().orElseThrow());
    Guest guest = guests().findById(stay.guestId()).orElseThrow();
    Folio folio = folios().findByStayId(stay.id()).orElse(null);
    return new StayView(stay, guest, folio);
  }
}
