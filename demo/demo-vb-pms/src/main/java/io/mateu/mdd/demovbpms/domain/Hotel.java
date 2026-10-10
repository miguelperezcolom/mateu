package io.mateu.mdd.demovbpms.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * The fictitious hotel every screen of the demo reads from: 40 rooms on 4 floors, ~60
 * reservations around the business date, folio charges and housekeeping status. In memory, seeded
 * deterministically at startup, with no business rules beyond what a screen needs to look real.
 */
public final class Hotel {

  public static final String PROPERTY = "Mateu Beach Resort";

  /** The business date: what OPERA shows in its header. Moved forward by End of Day. */
  private static LocalDate businessDate = LocalDate.of(2026, 10, 12);

  public record Room(
      String number,
      int floor,
      String type,
      String typeLabel,
      HousekeepingStatus status,
      boolean outOfOrder) {}

  public enum HousekeepingStatus {
    CL("Clean"),
    IP("Inspected"),
    DI("Dirty"),
    PU("Pickup"),
    OS("Out of service"),
    OO("Out of order");

    public final String label;

    HousekeepingStatus(String label) {
      this.label = label;
    }
  }

  public enum ReservationStatus {
    RESERVED,
    DUE_IN,
    IN_HOUSE,
    DUE_OUT,
    CHECKED_OUT,
    CANCELLED
  }

  public static final class Reservation {
    public String id;
    public String confirmation;
    public String guest;
    public String company;
    public String room; // may be null (unassigned)
    public String roomType;
    public LocalDate arrival;
    public LocalDate departure;
    public int adults;
    public int children;
    public String rateCode;
    public BigDecimal rate;
    public ReservationStatus status;
    public boolean vip;
    public String color; // reservation colour on the Room Diary
    public String notes = "";
    public String signature; // registration card signature (data URI)
    public String documentScan; // scanned ID (data URI)

    public int nights() {
      return (int) (departure.toEpochDay() - arrival.toEpochDay());
    }
  }

  public record Charge(
      String id,
      String reservationId,
      int window,
      LocalDate date,
      String code,
      String description,
      BigDecimal amount,
      BigDecimal tax) {}

  public static final List<Room> ROOMS = new CopyOnWriteArrayList<>();
  public static final List<Reservation> RESERVATIONS = new CopyOnWriteArrayList<>();
  public static final List<Charge> CHARGES = new CopyOnWriteArrayList<>();

  private static final String[] TYPES = {"STD", "SUP", "JRS", "STE"};
  private static final String[] TYPE_LABELS = {
    "Standard", "Superior", "Junior Suite", "Suite"
  };
  private static final String[] FIRST = {
    "Ana", "Luis", "Marta", "John", "Emma", "Pierre", "Sofia", "Hans", "Yuki", "Carlos", "Laura",
    "Peter", "Giulia", "Omar", "Ingrid", "Diego"
  };
  private static final String[] LAST = {
    "García", "Smith", "Müller", "Rossi", "Dubois", "Tanaka", "López", "Johnson", "Nilsson",
    "Fernández", "Brown", "Costa"
  };
  private static final String[] COMPANIES = {"", "", "", "Acme Corp", "Globex", "Initech"};
  private static final String[] COLORS = {"#0E7C86", "#0E7C86", "#0E7C86", "#6C5BB5", "#C46A00"};

  static {
    seed();
  }

  private Hotel() {}

  public static LocalDate businessDate() {
    return businessDate;
  }

  public static void rollBusinessDate() {
    businessDate = businessDate.plusDays(1);
  }

  public static synchronized void seed() {
    ROOMS.clear();
    RESERVATIONS.clear();
    CHARGES.clear();
    Random random = new Random(42);
    List<Room> rooms = new ArrayList<>();
    for (int floor = 1; floor <= 4; floor++) {
      for (int n = 1; n <= 10; n++) {
        int t = n <= 5 ? 0 : n <= 8 ? 1 : n == 9 ? 2 : 3;
        HousekeepingStatus st = HousekeepingStatus.values()[random.nextInt(4)];
        boolean ooo = floor == 3 && n == 7;
        rooms.add(
            new Room(
                floor + String.format("%02d", n),
                floor,
                TYPES[t],
                TYPE_LABELS[t],
                ooo ? HousekeepingStatus.OO : st,
                ooo));
      }
    }
    ROOMS.addAll(rooms);
    int seq = 1;
    for (Room room : rooms) {
      if (room.outOfOrder()) continue;
      LocalDate cursor = businessDate.minusDays(random.nextInt(6));
      while (cursor.isBefore(businessDate.plusDays(26))) {
        int nights = 1 + random.nextInt(6);
        if (random.nextInt(4) > 0) {
          Reservation r = new Reservation();
          r.id = "R" + (1000 + seq);
          r.confirmation = String.valueOf(48210000 + seq * 7);
          r.guest = LAST[random.nextInt(LAST.length)] + ", " + FIRST[random.nextInt(FIRST.length)];
          r.company = COMPANIES[random.nextInt(COMPANIES.length)];
          r.room = room.number();
          r.roomType = room.type();
          r.arrival = cursor;
          r.departure = cursor.plusDays(nights);
          r.adults = 1 + random.nextInt(2);
          r.children = random.nextInt(3) == 0 ? 1 : 0;
          r.rateCode = random.nextBoolean() ? "BAR" : random.nextBoolean() ? "PROMO" : "CORP";
          r.rate = BigDecimal.valueOf(90 + 30L * indexOf(room.type()) + random.nextInt(40));
          r.vip = random.nextInt(9) == 0;
          r.color = COLORS[random.nextInt(COLORS.length)];
          r.status = statusFor(r);
          RESERVATIONS.add(r);
          seq++;
        }
        cursor = cursor.plusDays(nights + random.nextInt(2));
      }
    }
    // charges for everybody in house or due out
    int c = 1;
    for (Reservation r : RESERVATIONS) {
      if (r.status != ReservationStatus.IN_HOUSE && r.status != ReservationStatus.DUE_OUT) continue;
      for (LocalDate d = r.arrival; d.isBefore(businessDate); d = d.plusDays(1)) {
        CHARGES.add(charge("C" + c++, r.id, 1, d, "1000", "Accommodation", r.rate));
        if (random.nextInt(3) == 0)
          CHARGES.add(charge("C" + c++, r.id, 1, d, "2010", "Restaurant", money(random, 18, 70)));
        if (random.nextInt(4) == 0)
          CHARGES.add(charge("C" + c++, r.id, 2, d, "2200", "Minibar", money(random, 6, 25)));
        if (random.nextInt(5) == 0)
          CHARGES.add(charge("C" + c++, r.id, 1, d, "3100", "Spa", money(random, 40, 90)));
      }
    }
  }

  private static BigDecimal money(Random random, int min, int max) {
    return BigDecimal.valueOf(min + random.nextInt(max - min)).setScale(2);
  }

  public static Charge charge(
      String id, String reservationId, int window, LocalDate date, String code, String desc,
      BigDecimal amount) {
    BigDecimal tax = amount.multiply(BigDecimal.valueOf(0.10)).setScale(2, java.math.RoundingMode.HALF_UP);
    return new Charge(id, reservationId, window, date, code, desc, amount.setScale(2), tax);
  }

  private static int indexOf(String type) {
    for (int i = 0; i < TYPES.length; i++) if (TYPES[i].equals(type)) return i;
    return 0;
  }

  public static ReservationStatus statusFor(Reservation r) {
    if (r.status == ReservationStatus.CANCELLED || r.status == ReservationStatus.CHECKED_OUT)
      return r.status;
    if (r.arrival.isAfter(businessDate)) return ReservationStatus.RESERVED;
    if (r.arrival.isEqual(businessDate)) return ReservationStatus.DUE_IN;
    if (r.departure.isEqual(businessDate)) return ReservationStatus.DUE_OUT;
    if (r.departure.isBefore(businessDate)) return ReservationStatus.CHECKED_OUT;
    return ReservationStatus.IN_HOUSE;
  }

  public static Optional<Reservation> reservation(String id) {
    return RESERVATIONS.stream().filter(r -> r.id.equals(id)).findFirst();
  }

  public static Optional<Room> room(String number) {
    return ROOMS.stream().filter(r -> r.number().equals(number)).findFirst();
  }

  public static List<Charge> chargesOf(String reservationId) {
    return CHARGES.stream().filter(c -> c.reservationId().equals(reservationId)).toList();
  }

  public static void replaceRoom(Room room) {
    Collections.replaceAll(
        ROOMS, room(room.number()).orElseThrow(), room);
  }

  /** A housekeeping round: a few rooms move on in the cleaning cycle (dirty → pickup → clean → inspected). */
  public static void housekeepingRound() {
    var random = new Random();
    var cycle = List.of(HousekeepingStatus.DI, HousekeepingStatus.PU, HousekeepingStatus.CL, HousekeepingStatus.IP);
    for (int i = 0; i < 3; i++) {
      var room = ROOMS.get(random.nextInt(ROOMS.size()));
      if (room.outOfOrder() || !cycle.contains(room.status())) continue;
      var next = cycle.get((cycle.indexOf(room.status()) + 1) % cycle.size());
      replaceRoom(new Room(room.number(), room.floor(), room.type(), room.typeLabel(), next, false));
    }
  }

  /** Sets the housekeeping status of several rooms at once (the Housekeeping Board's Set Room Status). */
  public static void setRoomStatus(List<String> numbers, HousekeepingStatus status) {
    for (var number : numbers) {
      room(number).ifPresent(r -> replaceRoom(new Room(r.number(), r.floor(), r.type(), r.typeLabel(), status,
          status == HousekeepingStatus.OO)));
    }
  }

  /** Reservations overlapping [from, to) on a room, excluding {@code exceptId}. */
  public static List<Reservation> overlapping(
      String roomNumber, LocalDate from, LocalDate to, String exceptId) {
    return RESERVATIONS.stream()
        .filter(r -> roomNumber.equals(r.room))
        .filter(r -> r.status != ReservationStatus.CANCELLED)
        .filter(r -> !r.id.equals(exceptId))
        .filter(r -> r.arrival.isBefore(to) && r.departure.isAfter(from))
        .toList();
  }
}
