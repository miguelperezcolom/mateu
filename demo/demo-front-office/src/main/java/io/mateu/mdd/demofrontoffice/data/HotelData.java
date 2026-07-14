package io.mateu.mdd.demofrontoffice.data;

import io.mateu.uidl.data.AddOn;
import io.mateu.uidl.data.LedgerLine;
import io.mateu.uidl.data.ProcessItem;
import io.mateu.uidl.data.ResourceItem;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

/**
 * In-memory fixtures of the Front-Office Suite demo: today's arrivals and departures, the in-house
 * guests, the floor's rooms, the charge catalog and the monitored automations. A {@code @Service}
 * so screens can inject it, with static accessors so reflectively-built view models (wizard steps)
 * can reach the same data.
 */
@Service
public class HotelData {

  // ── Arrivals (check-in) ──────────────────────────────────────────────────────

  public record Arrival(
      String id,
      String name,
      String room,
      int nights,
      String tier,
      String subtitle,
      Double total,
      String agency,
      String loyalty,
      String staysCaption,
      List<String> prefs,
      int pendingComplaints,
      String lastStay,
      String doc,
      boolean verified,
      String email,
      String phone,
      int pax,
      String board,
      String roomType,
      String stay) {}

  private static final Map<String, Arrival> ARRIVALS = new LinkedHashMap<>();

  static {
    ARRIVALS.put(
        "maria",
        new Arrival(
            "maria",
            "María Fernández",
            "1204",
            7,
            "PLATINUM",
            "Ocean Suite · 30 Apr → 07 May · 7N · 2pax · All Inclusive",
            4890.0,
            "TUI Group · TUI Magic Life",
            "48.500",
            "23 estancias",
            List.of("High floor", "Extra pillows", "Late checkout", "Quiet room", "Sea view"),
            2,
            "Hab 1408 · Hotel Aruba · Feb 2026 · 5N",
            "12345678X",
            true,
            "m.fernandez@email.com",
            "+34 612 345 678",
            2,
            "All Inclusive",
            "Ocean Suite",
            "30 Apr → 07 May"));
    ARRIVALS.put(
        "james",
        new Arrival(
            "james",
            "James Whitfield",
            "805",
            3,
            "GOLD",
            "Deluxe King · 30 Apr → 03 May · 3N · 1pax · Media pensión",
            1260.0,
            "Directo · Web",
            "12.300",
            "8 estancias",
            List.of("King bed", "Quiet room"),
            0,
            "Hab 512 · Hotel Bávaro · Nov 2025 · 4N",
            "",
            false,
            "",
            "",
            1,
            "Media pensión",
            "Deluxe King",
            "30 Apr → 03 May"));
    ARRIVALS.put(
        "klaus",
        new Arrival(
            "klaus",
            "Klaus Hoffmann",
            "612",
            4,
            "SILVER",
            "Family Room · 30 Apr → 04 May · 4N · 4pax · Todo incluido",
            2140.0,
            "TUI Deutschland",
            "6.850",
            "4 estancias",
            List.of("Connecting rooms", "Baby cot"),
            0,
            "Hab 610 · Hotel Punta Cana · Jul 2025 · 7N",
            "",
            false,
            "",
            "",
            4,
            "Todo incluido",
            "Family Room",
            "30 Apr → 04 May"));
  }

  public static Arrival arrival(String id) {
    return ARRIVALS.getOrDefault(id, ARRIVALS.get("maria"));
  }

  public static List<Arrival> arrivals() {
    return List.copyOf(ARRIVALS.values());
  }

  // ── Rooms of floor 12 ───────────────────────────────────────────────────────

  public static List<ResourceItem> rooms(String selectedId) {
    return List.of(
        room("1201", "Ocupada", "Sucia", "contrast", null, null, true, false, selectedId),
        room("1202", "Libre", "Limpia", "success", null, null, false, false, selectedId),
        room("1203", "Ocupada", "Sucia", "contrast", null, null, true, false, selectedId),
        room("1204", "Ocean Suite", "Inspeccionada", "success", null, null, false, true, selectedId),
        room("1205", "Libre", "Limpia", "success", null, null, false, false, selectedId),
        room("1206", "Libre", "Limpia", "success", "Ducha averiada", "error", false, false, selectedId),
        room("1207", "Libre", "Limpia", "success", null, null, false, false, selectedId),
        room("1208", "Libre", "Sucia", "contrast", "A/C ruidoso", "error", false, false, selectedId));
  }

  private static ResourceItem room(
      String id,
      String subtitle,
      String statusLabel,
      String statusColor,
      String note,
      String noteColor,
      boolean disabled,
      boolean recommended,
      String selectedId) {
    return ResourceItem.builder()
        .id(id)
        .title(id)
        .subtitle(subtitle)
        .statusLabel(statusLabel)
        .statusColor(statusColor)
        .note(note)
        .noteColor(noteColor)
        .disabled(disabled)
        .recommended(recommended)
        .selected(id.equals(selectedId))
        .build();
  }

  // ── Extras (add-on catalog of the check-in wizard) ──────────────────────────

  public static List<AddOn> addOns(Set<String> addedIds) {
    return List.of(
        addOn("allinc", "🍹", "Paquete All Inclusive", "Todo incluido · 7 noches · 2 pax", 343.0, "estancia", null, addedIds),
        addOn("premium", "🥂", "Paquete Bebidas Premium", "Marcas premium · 7 noches · 2 pax", 196.0, "estancia", null, addedIds),
        addOn("transfer", "🚐", "Transfer aeropuerto", "Punta Cana → Hotel · Privado", 45.0, "trayecto", null, addedIds),
        addOn("late", "🕕", "Late check-out", "Hasta las 18:00h", 40.0, null, null, addedIds),
        addOn("cena", "🌹", "Cena romántica", "Mesa privada en la playa", 220.0, null, null, addedIds),
        addOn("parking", "🅿", "Parking", "Cubierto · Vigilancia 24h", null, null, "Incluido Platinum", addedIds),
        addOn("babysitting", "🧸", "Babysitting", "Servicio nocturno · 4h", 120.0, null, null, addedIds));
  }

  private static AddOn addOn(
      String id,
      String icon,
      String title,
      String description,
      Double price,
      String unit,
      String includedLabel,
      Set<String> addedIds) {
    return AddOn.builder()
        .id(id)
        .icon(icon)
        .title(title)
        .description(description)
        .price(price)
        .unit(unit)
        .includedLabel(includedLabel)
        .added(addedIds != null && addedIds.contains(id))
        .build();
  }

  // ── Departures (check-out) ──────────────────────────────────────────────────

  public record Departure(
      String id,
      String name,
      String room,
      String tier,
      String subtitle,
      List<LedgerLine> folio,
      Double total,
      Double preauthorized,
      String email) {}

  private static final Map<String, Departure> DEPARTURES = new LinkedHashMap<>();

  static {
    DEPARTURES.put(
        "carlos",
        new Departure(
            "carlos",
            "Carlos Mendoza",
            "1108",
            "GOLD",
            "Hab 1108 · Suite · All Inclusive · 7N",
            List.of(
                LedgerLine.builder().concept("Alojamiento x7 noches").amount(1540.0).build(),
                LedgerLine.builder()
                    .concept("All Inclusive Package")
                    .included(true)
                    .includedLabel("Incluido")
                    .build(),
                LedgerLine.builder().concept("Spa — Couple Massage").amount(180.0).build(),
                LedgerLine.builder().concept("Minibar — 28 Apr").amount(42.5).build(),
                LedgerLine.builder().concept("Room Service — 29 Apr").amount(67.0).build(),
                LedgerLine.builder().concept("City Tax (7 noches)").amount(35.0).build(),
                LedgerLine.builder().concept("Descuento Platinum -10%").amount(-154.0).build()),
            1710.5,
            1800.0,
            "c.mendoza@email.com"));
    DEPARTURES.put(
        "yuki",
        new Departure(
            "yuki",
            "Yuki Tanaka",
            "703",
            "SILVER",
            "Hab 703 · Standard · Alojamiento y desayuno · 4N",
            List.of(
                LedgerLine.builder().concept("Alojamiento x4 noches").amount(620.0).build(),
                LedgerLine.builder().concept("Desayuno buffet").included(true).includedLabel("Incluido").build(),
                LedgerLine.builder().concept("Minibar — 27 Apr").amount(18.5).build(),
                LedgerLine.builder().concept("City Tax (4 noches)").amount(20.0).build()),
            658.5,
            800.0,
            "y.tanaka@email.com"));
    DEPARTURES.put(
        "sophie",
        new Departure(
            "sophie",
            "Sophie Laurent",
            "901",
            "PLATINUM",
            "Hab 901 · Premium Sea View · All Inclusive · 5N",
            List.of(
                LedgerLine.builder().concept("Alojamiento x5 noches").amount(1100.0).build(),
                LedgerLine.builder().concept("All Inclusive Package").included(true).includedLabel("Incluido").build(),
                LedgerLine.builder().concept("Spa — Circuito x2").amount(90.0).build(),
                LedgerLine.builder().concept("Room Service — 27 Apr").amount(50.0).build()),
            1240.0,
            1800.0,
            "s.laurent@email.com"));
    DEPARTURES.put(
        "emma",
        new Departure(
            "emma",
            "Emma Richardson",
            "1015",
            "SILVER",
            "Hab 1015 · Junior Suite · Media pensión · 3N",
            List.of(
                LedgerLine.builder().concept("Alojamiento x3 noches").amount(540.0).build(),
                LedgerLine.builder().concept("Cena 29 Apr").amount(64.0).build(),
                LedgerLine.builder().concept("City Tax (3 noches)").amount(15.0).build()),
            619.0,
            700.0,
            "e.richardson@email.com"));
  }

  public static Departure departure(String id) {
    return DEPARTURES.getOrDefault(id, DEPARTURES.get("carlos"));
  }

  public static List<Departure> departures() {
    return List.copyOf(DEPARTURES.values());
  }

  // ── In-house guests (guest 360) ─────────────────────────────────────────────

  public record InHouse(
      String id,
      String name,
      String room,
      String roomType,
      String tier,
      String subtitle,
      String deseos,
      String vip,
      String loyalty,
      String staysCaption,
      Double balance,
      Double preauthorized,
      List<Incident> incidents,
      List<Companion> companions,
      int stays,
      int nights,
      int years,
      int complaints,
      int hotels) {}

  public record Incident(String id, String icon, String title, String description, String status, String statusColor) {}

  public record Companion(String id, String name, String description) {}

  private static final Map<String, InHouse> IN_HOUSE = new LinkedHashMap<>();

  static {
    IN_HOUSE.put(
        "sophie",
        new InHouse(
            "sophie",
            "Sophie Laurent",
            "901",
            "Premium Sea View",
            "PLATINUM",
            "Premium Sea View · Hab 901 · Sal. 02 May · All Inclusive",
            "Deseos 3/3",
            "VIP — Anniversary",
            "61.200",
            "31 estancias",
            1240.0,
            1800.0,
            List.of(
                new Incident(
                    "ac",
                    "🌡",
                    "Aire acondicionado con ruido",
                    "Habitación 901 · Reportado 28 Apr · Mantenimiento avisado",
                    "En curso",
                    "normal"),
                new Incident(
                    "rs",
                    "🍽",
                    "Retraso en room service",
                    "Cena 27 Apr · Compensada con detalle de bienvenida",
                    "Abierta",
                    "warning")),
            List.of(new Companion("lucas", "Lucas Laurent", "Doc FR-4471882 · Adulto · Titular secundario")),
            31,
            178,
            7,
            2,
            9));
    IN_HOUSE.put(
        "carlos",
        new InHouse(
            "carlos",
            "Carlos Mendoza",
            "1108",
            "Suite",
            "GOLD",
            "Suite · Hab 1108 · Sal. 01 May · All Inclusive",
            "Deseos 1/3",
            null,
            "22.400",
            "14 estancias",
            1655.5,
            1800.0,
            List.of(
                new Incident(
                    "tv",
                    "📺",
                    "TV sin señal en canales internacionales",
                    "Habitación 1108 · Reportado 29 Apr",
                    "Abierta",
                    "warning")),
            List.of(new Companion("ana", "Ana Mendoza", "Doc 55443322M · Adulto · Acompañante")),
            14,
            61,
            4,
            1,
            3));
    IN_HOUSE.put(
        "yuki",
        new InHouse(
            "yuki",
            "Yuki Tanaka",
            "703",
            "Standard",
            "SILVER",
            "Standard · Hab 703 · Sal. 30 Apr · AD",
            "Deseos 2/2",
            null,
            "4.100",
            "3 estancias",
            658.5,
            800.0,
            List.of(),
            List.of(),
            3,
            9,
            2,
            0,
            1));
    IN_HOUSE.put(
        "emma",
        new InHouse(
            "emma",
            "Emma Richardson",
            "1015",
            "Junior Suite",
            "SILVER",
            "Junior Suite · Hab 1015 · Sal. 03 May · Media pensión",
            "Deseos 2/4",
            null,
            "7.900",
            "6 estancias",
            619.0,
            700.0,
            List.of(
                new Incident(
                    "queja",
                    "⚠",
                    "Queja activa — ruido en pasillo",
                    "Reportada 28 Apr · Pendiente de respuesta",
                    "Abierta",
                    "error")),
            List.of(),
            6,
            22,
            3,
            1,
            2));
  }

  public static InHouse inHouse(String id) {
    return IN_HOUSE.getOrDefault(id, IN_HOUSE.get("sophie"));
  }

  public static List<InHouse> inHouseGuests() {
    return List.copyOf(IN_HOUSE.values());
  }

  // ── Charge catalog (check-out "postear cargo" lookup) ──────────────────────

  public record CatalogItem(String code, String name, Double price) {}

  public static final List<CatalogItem> CATALOG =
      List.of(
          new CatalogItem("RS-01", "Room Service", 25.0),
          new CatalogItem("MB-02", "Minibar", 12.5),
          new CatalogItem("SPA-03", "Masaje", 90.0),
          new CatalogItem("LAU-04", "Lavandería", 18.0));

  // ── Monitored automations ───────────────────────────────────────────────────

  public static List<ProcessItem> processes() {
    return List.of(
        process("credit", "Facturación a Crédito", List.of("OHIP", "OIC", "Voxel"), 847, 6, 0, "warning", "Solucionar", "fixCredit"),
        process("discrepancias", "Gestión de Discrepancias de Reserva", List.of("CRS", "OHIP", "RACK"), 1204, 7, 0, "warning", "Solucionar", "fixDiscrepancias"),
        process("prepagos", "Prepagos", List.of("OHIP", "OIC", "FreedomPay"), 932, 4, 0, "warning", "Solucionar", "fixPrepagos"),
        process("interhoteles", "Interhoteles", List.of("OHIP", "Red de Hoteles"), 156, 4, 0, "warning", "Solucionar", "fixInterhoteles"),
        process("comercializadora", "Comercializadora", List.of("OHIP", "ERP Fusion A/R"), 418, 0, 0, "ok", null, null),
        process("noshow", "No Show y Cancelaciones", List.of("OHIP", "OIC", "Voxel", "FreedomPay"), 170, 5, 0, "warning", "Solucionar", "fixNoShow"),
        process("digital", "Digital Check-In / Check-Out", List.of("Civitfun", "OHIP", "SES", "App Móvil"), 6104, 4, 0, "warning", "Ver warnings", "fixDigital"));
  }

  private static ProcessItem process(
      String id,
      String name,
      List<String> systems,
      int ok,
      int warnings,
      int errors,
      String status,
      String actionLabel,
      String actionId) {
    return ProcessItem.builder()
        .id(id)
        .name(name)
        .systems(systems)
        .ok(ok)
        .warnings(warnings)
        .errors(errors)
        .status(status)
        .actionLabel(actionLabel)
        .actionId(actionId)
        .build();
  }
}
