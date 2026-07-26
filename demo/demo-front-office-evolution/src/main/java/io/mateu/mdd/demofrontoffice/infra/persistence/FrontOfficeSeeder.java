package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.automation.Automation;
import io.mateu.mdd.demofrontoffice.domain.automation.AutomationRepository;
import io.mateu.mdd.demofrontoffice.domain.automation.ConnectedSystem;
import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogItem;
import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogRepository;
import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogItem;
import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogRepository;
import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioLine;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioRepository;
import io.mateu.mdd.demofrontoffice.domain.guest.Guest;
import io.mateu.mdd.demofrontoffice.domain.guest.GuestRepository;
import io.mateu.mdd.demofrontoffice.domain.guest.GuestTier;
import io.mateu.mdd.demofrontoffice.domain.guest.Preference;
import io.mateu.mdd.demofrontoffice.domain.room.HousekeepingStatus;
import io.mateu.mdd.demofrontoffice.domain.room.Room;
import io.mateu.mdd.demofrontoffice.domain.room.RoomOccupancy;
import io.mateu.mdd.demofrontoffice.domain.room.RoomRepository;
import io.mateu.mdd.demofrontoffice.domain.stay.Companion;
import io.mateu.mdd.demofrontoffice.domain.stay.Incident;
import io.mateu.mdd.demofrontoffice.domain.stay.IncidentStatus;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayRepository;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Populates the H2 database on startup with the front-office sample data: today's arrivals, the
 * in-house guests with their folios, the rooms, the monitored automations and the reference
 * catalogs. Dates are relative to {@code LocalDate.now()} so the check-in/check-out queues are
 * always "today's". Idempotent: skipped when guests already exist (file-backed databases).
 */
@Component
public class FrontOfficeSeeder implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(FrontOfficeSeeder.class);

  private final GuestRepository guests;
  private final StayRepository stays;
  private final FolioRepository folios;
  private final RoomRepository rooms;
  private final AutomationRepository automations;
  private final ChargeCatalogRepository chargeCatalog;
  private final AddOnCatalogRepository addOnCatalog;

  public FrontOfficeSeeder(
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
  }

  @Override
  public void run(ApplicationArguments args) {
    if (!guests.findAll().isEmpty()) {
      log.info("Front-office database already populated — skipping seed");
      return;
    }
    LocalDate today = LocalDate.now();
    seedGuests();
    seedStays(today);
    seedFolios();
    seedRooms();
    seedAutomations();
    seedCatalogs();
    log.info(
        "Front-office database seeded: {} guests, {} stays ({} arriving, {} in-house), {} rooms,"
            + " {} automations",
        guests.findAll().size(),
        stays.findAll().size(),
        stays.findArrivals().size(),
        stays.findInHouse().size(),
        rooms.findAll().size(),
        automations.findAll().size());
  }

  private void seedGuests() {
    guests.save(
        new Guest(
            "maria", "María Fernández", "12345678X", true, "m.fernandez@email.com",
            "+34 612 345 678", GuestTier.PLATINUM, 48500, 23, 96, 6, 2, 5,
            "Hab 1408 · Hotel Aruba", "Feb 2026 · 5N",
            preferences("High floor", "Extra pillows", "Late checkout", "Quiet room", "Sea view")));
    guests.save(
        new Guest(
            "james", "James Whitfield", null, false, null, null, GuestTier.GOLD, 12300, 8, 27, 3,
            0, 2, "Hab 512 · Hotel Bávaro", "Nov 2025 · 4N",
            preferences("King bed", "Quiet room")));
    guests.save(
        new Guest(
            "klaus", "Klaus Hoffmann", null, false, null, null, GuestTier.SILVER, 6850, 4, 19, 2,
            0, 2, "Hab 610 · Hotel Punta Cana", "Jul 2025 · 7N",
            preferences("Connecting rooms", "Baby cot")));
    guests.save(
        new Guest(
            "carlos", "Carlos Mendoza", "55112233K", true, "c.mendoza@email.com", null,
            GuestTier.GOLD, 22400, 14, 61, 4, 1, 3, "Hab 902 · Hotel Cancún", "Dic 2025 · 6N",
            preferences("Late checkout")));
    guests.save(
        new Guest(
            "yuki", "Yuki Tanaka", "JP8877441", true, "y.tanaka@email.com", null, GuestTier.SILVER,
            4100, 3, 9, 2, 0, 1, "Hab 421 · Hotel Bávaro", "Ago 2025 · 3N",
            preferences("Quiet room")));
    guests.save(
        new Guest(
            "sophie", "Sophie Laurent", "FR-2231907", true, "s.laurent@email.com", null,
            GuestTier.PLATINUM, 61200, 31, 178, 7, 2, 9, "Hab 1204 · Hotel Aruba", "Ene 2026 · 6N",
            preferences("Sea view", "High floor", "Champagne on arrival")));
    guests.save(
        new Guest(
            "emma", "Emma Richardson", "GB4455123", true, "e.richardson@email.com", null,
            GuestTier.SILVER, 7900, 6, 22, 3, 1, 2, "Hab 1015 · Hotel Punta Cana", "Oct 2025 · 4N",
            preferences("Extra pillows")));
  }

  private static List<Preference> preferences(String... texts) {
    return List.of(texts).stream().map(Preference::new).toList();
  }

  private void seedStays(LocalDate today) {
    // Today's arrivals (the check-in queue)
    stays.save(
        new Stay(
            "st-maria", "maria", "1204", "Ocean Suite", "All Inclusive", today, today.plusDays(7),
            2, "TUI Group · TUI Magic Life", new BigDecimal("4890.00"), StayStatus.ARRIVING, 0, 0,
            null,
            List.of(
                new Companion(
                    "juan", "Juan Fernández", "87654321Y", true, "j.fernandez@email.com",
                    "+34 600 111 222", "Doc 87654321Y · Adulto")),
            List.of(), Set.of()));
    stays.save(
        new Stay(
            "st-james", "james", "805", "Deluxe King", "Media pensión", today, today.plusDays(3),
            1, "Directo · Web", new BigDecimal("1260.00"), StayStatus.ARRIVING, 0, 0, null,
            List.of(), List.of(), Set.of()));
    stays.save(
        new Stay(
            "st-klaus", "klaus", "612", "Family Room", "Todo incluido", today, today.plusDays(4),
            4, "TUI Deutschland", new BigDecimal("2140.00"), StayStatus.ARRIVING, 0, 0, null,
            List.of(), List.of(), Set.of()));

    // In-house guests (the "en casa" 360 and the check-out queue)
    stays.save(
        new Stay(
            "st-carlos", "carlos", "1108", "Suite", "All Inclusive", today.minusDays(7), today, 2,
            "Directo · Web", new BigDecimal("1710.50"), StayStatus.IN_HOUSE, 1, 3, null,
            List.of(
                new Companion(
                    "ana", "Ana Mendoza", "55443322M", true, "a.mendoza@email.com",
                    "+34 600 333 444", "Doc 55443322M · Adulto · Acompañante")),
            List.of(
                new Incident(
                    "tv", "📺", "TV sin señal en canales internacionales",
                    "Habitación 1108 · Reportado hace 1 día", IncidentStatus.OPEN, false)),
            Set.of()));
    stays.save(
        new Stay(
            "st-yuki", "yuki", "703", "Standard", "Alojamiento y desayuno", today.minusDays(4),
            today, 1, "Booking.com", new BigDecimal("658.50"), StayStatus.IN_HOUSE, 2, 2, null,
            List.of(), List.of(), Set.of()));
    stays.save(
        new Stay(
            "st-sophie", "sophie", "901", "Premium Sea View", "All Inclusive", today.minusDays(4),
            today.plusDays(1), 2, "Directo · Club", new BigDecimal("1240.00"), StayStatus.IN_HOUSE,
            3, 3, "VIP — Anniversary",
            List.of(
                new Companion(
                    "lucas", "Lucas Laurent", "FR-4471882", true, "l.laurent@email.com",
                    "+33 6 11 22 33 44", "Doc FR-4471882 · Adulto · Titular secundario")),
            List.of(
                new Incident(
                    "ac", "🌡", "Aire acondicionado con ruido",
                    "Habitación 901 · Mantenimiento avisado", IncidentStatus.IN_PROGRESS, false),
                new Incident(
                    "rs", "🍽", "Retraso en room service",
                    "Cena de anoche · Compensada con detalle de bienvenida", IncidentStatus.OPEN,
                    false)),
            Set.of()));
    stays.save(
        new Stay(
            "st-emma", "emma", "1015", "Junior Suite", "Media pensión", today.minusDays(1),
            today.plusDays(2), 1, "Expedia", new BigDecimal("619.00"), StayStatus.IN_HOUSE, 2, 4,
            null, List.of(),
            List.of(
                new Incident(
                    "queja", "⚠", "Queja activa — ruido en pasillo",
                    "Reportada hace 2 días · Pendiente de respuesta", IncidentStatus.OPEN, true)),
            Set.of()));
  }

  private void seedFolios() {
    folios.save(
        new Folio(
            "f-carlos", "st-carlos", new BigDecimal("1800.00"),
            List.of(
                FolioLine.charge("Alojamiento x7 noches", new BigDecimal("1540.00")),
                FolioLine.includedInPackage("All Inclusive Package", "Incluido"),
                FolioLine.charge("Spa — Couple Massage", new BigDecimal("180.00")),
                FolioLine.charge("Minibar", new BigDecimal("42.50")),
                FolioLine.charge("Room Service", new BigDecimal("67.00")),
                FolioLine.charge("City Tax (7 noches)", new BigDecimal("35.00")),
                FolioLine.charge("Descuento Platinum -10%", new BigDecimal("-154.00")))));
    folios.save(
        new Folio(
            "f-yuki", "st-yuki", new BigDecimal("800.00"),
            List.of(
                FolioLine.charge("Alojamiento x4 noches", new BigDecimal("620.00")),
                FolioLine.includedInPackage("Desayuno buffet", "Incluido"),
                FolioLine.charge("Minibar", new BigDecimal("18.50")),
                FolioLine.charge("City Tax (4 noches)", new BigDecimal("20.00")))));
    folios.save(
        new Folio(
            "f-sophie", "st-sophie", new BigDecimal("1800.00"),
            List.of(
                FolioLine.charge("Alojamiento x5 noches", new BigDecimal("1100.00")),
                FolioLine.includedInPackage("All Inclusive Package", "Incluido"),
                FolioLine.charge("Spa — Circuito x2", new BigDecimal("90.00")),
                FolioLine.charge("Room Service", new BigDecimal("50.00")))));
    folios.save(
        new Folio(
            "f-emma", "st-emma", new BigDecimal("700.00"),
            List.of(
                FolioLine.charge("Alojamiento x3 noches", new BigDecimal("540.00")),
                FolioLine.charge("Cena", new BigDecimal("64.00")),
                FolioLine.charge("City Tax (3 noches)", new BigDecimal("15.00")))));
  }

  private void seedRooms() {
    // Floor 12 — the room-assignment step of the check-in wizard
    rooms.save(room("1201", 12, null, RoomOccupancy.OCCUPIED, HousekeepingStatus.DIRTY, null));
    rooms.save(room("1202", 12, null, RoomOccupancy.FREE, HousekeepingStatus.CLEAN, null));
    rooms.save(room("1203", 12, null, RoomOccupancy.OCCUPIED, HousekeepingStatus.DIRTY, null));
    rooms.save(
        room("1204", 12, "Ocean Suite", RoomOccupancy.FREE, HousekeepingStatus.INSPECTED, null));
    rooms.save(room("1205", 12, null, RoomOccupancy.FREE, HousekeepingStatus.CLEAN, null));
    rooms.save(
        room("1206", 12, null, RoomOccupancy.FREE, HousekeepingStatus.CLEAN, "Ducha averiada"));
    rooms.save(room("1207", 12, null, RoomOccupancy.FREE, HousekeepingStatus.CLEAN, null));
    rooms.save(
        room("1208", 12, null, RoomOccupancy.FREE, HousekeepingStatus.DIRTY, "A/C ruidoso"));

    // Rooms referenced by the other stays
    rooms.save(
        room("805", 8, "Deluxe King", RoomOccupancy.FREE, HousekeepingStatus.INSPECTED, null));
    rooms.save(
        room("612", 6, "Family Room", RoomOccupancy.FREE, HousekeepingStatus.INSPECTED, null));
    rooms.save(room("1108", 11, "Suite", RoomOccupancy.OCCUPIED, HousekeepingStatus.CLEAN, null));
    rooms.save(room("703", 7, "Standard", RoomOccupancy.OCCUPIED, HousekeepingStatus.CLEAN, null));
    rooms.save(
        room("901", 9, "Premium Sea View", RoomOccupancy.OCCUPIED, HousekeepingStatus.CLEAN, null));
    rooms.save(
        room("1015", 10, "Junior Suite", RoomOccupancy.OCCUPIED, HousekeepingStatus.CLEAN, null));
  }

  private static Room room(
      String number,
      int floor,
      String type,
      RoomOccupancy occupancy,
      HousekeepingStatus housekeeping,
      String maintenanceNote) {
    return new Room(number, floor, type, occupancy, housekeeping, maintenanceNote);
  }

  private void seedAutomations() {
    automations.save(automation("credit", "Facturación a Crédito", 847, 6, "OHIP", "OIC", "Voxel"));
    automations.save(
        automation(
            "discrepancias", "Gestión de Discrepancias de Reserva", 1204, 7, "CRS", "OHIP",
            "RACK"));
    automations.save(automation("prepagos", "Prepagos", 932, 4, "OHIP", "OIC", "FreedomPay"));
    automations.save(automation("interhoteles", "Interhoteles", 156, 4, "OHIP", "Red de Hoteles"));
    automations.save(
        automation("comercializadora", "Comercializadora", 418, 0, "OHIP", "ERP Fusion A/R"));
    automations.save(
        automation(
            "noshow", "No Show y Cancelaciones", 170, 5, "OHIP", "OIC", "Voxel", "FreedomPay"));
    automations.save(
        automation(
            "digital", "Digital Check-In / Check-Out", 6104, 4, "Civitfun", "OHIP", "SES",
            "App Móvil"));
  }

  private static Automation automation(
      String id, String name, int ok, int warnings, String... systems) {
    return new Automation(
        id, name, ok, warnings, 0, List.of(systems).stream().map(ConnectedSystem::new).toList());
  }

  private void seedCatalogs() {
    chargeCatalog.save(new ChargeCatalogItem("RS-01", "Room Service", new BigDecimal("25.00")));
    chargeCatalog.save(new ChargeCatalogItem("MB-02", "Minibar", new BigDecimal("12.50")));
    chargeCatalog.save(new ChargeCatalogItem("SPA-03", "Masaje", new BigDecimal("90.00")));
    chargeCatalog.save(new ChargeCatalogItem("LAU-04", "Lavandería", new BigDecimal("18.00")));

    addOnCatalog.save(
        new AddOnCatalogItem(
            "allinc", "🍹", "Paquete All Inclusive", "Todo incluido · 7 noches · 2 pax",
            new BigDecimal("343.00"), "estancia", null));
    addOnCatalog.save(
        new AddOnCatalogItem(
            "premium", "🥂", "Paquete Bebidas Premium", "Marcas premium · 7 noches · 2 pax",
            new BigDecimal("196.00"), "estancia", null));
    addOnCatalog.save(
        new AddOnCatalogItem(
            "transfer", "🚐", "Transfer aeropuerto", "Punta Cana → Hotel · Privado",
            new BigDecimal("45.00"), "trayecto", null));
    addOnCatalog.save(
        new AddOnCatalogItem(
            "late", "🕕", "Late check-out", "Hasta las 18:00h", new BigDecimal("40.00"), null,
            null));
    addOnCatalog.save(
        new AddOnCatalogItem(
            "cena", "🌹", "Cena romántica", "Mesa privada en la playa", new BigDecimal("220.00"),
            null, null));
    addOnCatalog.save(
        new AddOnCatalogItem(
            "parking", "🅿", "Parking", "Cubierto · Vigilancia 24h", null, null,
            "Incluido Platinum"));
    addOnCatalog.save(
        new AddOnCatalogItem(
            "babysitting", "🧸", "Babysitting", "Servicio nocturno · 4h", new BigDecimal("120.00"),
            null, null));
  }
}
