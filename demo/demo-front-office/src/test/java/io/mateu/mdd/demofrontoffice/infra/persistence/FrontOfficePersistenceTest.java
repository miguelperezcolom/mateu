package io.mateu.mdd.demofrontoffice.infra.persistence;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.mdd.demofrontoffice.domain.automation.AutomationRepository;
import io.mateu.mdd.demofrontoffice.domain.automation.AutomationStatus;
import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogRepository;
import io.mateu.mdd.demofrontoffice.domain.catalog.ChargeCatalogRepository;
import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioLine;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioRepository;
import io.mateu.mdd.demofrontoffice.domain.guest.Guest;
import io.mateu.mdd.demofrontoffice.domain.guest.GuestRepository;
import io.mateu.mdd.demofrontoffice.domain.room.Room;
import io.mateu.mdd.demofrontoffice.domain.room.RoomOccupancy;
import io.mateu.mdd.demofrontoffice.domain.room.RoomRepository;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayRepository;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Boots the whole app (H2 + seeder + adapters) and checks the seed data is queryable through the
 * domain ports and that aggregates round-trip (domain behavior → save → reload).
 */
@SpringBootTest
class FrontOfficePersistenceTest {

  @Autowired GuestRepository guests;
  @Autowired StayRepository stays;
  @Autowired FolioRepository folios;
  @Autowired RoomRepository rooms;
  @Autowired AutomationRepository automations;
  @Autowired ChargeCatalogRepository chargeCatalog;
  @Autowired AddOnCatalogRepository addOnCatalog;

  @Test
  void databaseIsSeededOnStartup() {
    assertEquals(7, guests.findAll().size());

    // the check-in queue holds today's arrivals (st-james may check in in the other test)
    var arrivalIds = stays.findArrivals().stream().map(Stay::id).toList();
    assertTrue(arrivalIds.contains("st-maria"));
    assertTrue(arrivalIds.contains("st-klaus"));

    // the in-house queue is ordered by departure date
    var inHouse = stays.findInHouse();
    assertTrue(inHouse.stream().map(Stay::id).toList().contains("st-sophie"));
    for (int i = 1; i < inHouse.size(); i++) {
      assertFalse(inHouse.get(i).checkOut().isBefore(inHouse.get(i - 1).checkOut()));
    }

    // sophie's 360: companions and incidents rehydrate with the aggregate
    Stay sophie = stays.findById("st-sophie").orElseThrow();
    assertEquals(1, sophie.companions().size());
    assertEquals(2, sophie.incidents().size());
    assertEquals(2, sophie.openIncidents());

    // carlos' folio: balance derived from lines, covered by the preauthorization
    Folio carlos = folios.findByStayId("st-carlos").orElseThrow();
    assertEquals(0, new BigDecimal("1710.50").compareTo(carlos.balance()));
    assertTrue(carlos.coveredByPreauthorization());

    assertEquals(8, rooms.findByFloor(12).size());
    assertTrue(rooms.findByNumber("1204").orElseThrow().assignable());

    assertEquals(AutomationStatus.WARNING, automations.findById("credit").orElseThrow().status());
    assertEquals(
        AutomationStatus.OK, automations.findById("comercializadora").orElseThrow().status());

    assertEquals(4, chargeCatalog.findAll().size());
    assertEquals(1, chargeCatalog.search("mini").size());
    assertEquals(7, addOnCatalog.findAll().size());
  }

  @Test
  void aggregatesRoundTripThroughH2() {
    // check-in lifecycle: arriving → in-house, persisted and reloaded
    Stay james = stays.findById("st-james").orElseThrow();
    stays.save(james.assignRoom("805", "Deluxe King").completeCheckIn());
    assertEquals(StayStatus.IN_HOUSE, stays.findById("st-james").orElseThrow().status());

    // posting a charge grows the reloaded folio's balance
    Folio yuki = folios.findByStayId("st-yuki").orElseThrow();
    BigDecimal before = yuki.balance();
    folios.save(yuki.post(FolioLine.charge("Room Service", new BigDecimal("25.00"))));
    Folio reloaded = folios.findByStayId("st-yuki").orElseThrow();
    assertEquals(0, before.add(new BigDecimal("25.00")).compareTo(reloaded.balance()));

    // guest identity verification survives the round-trip
    Guest verified = guests.findById("james").orElseThrow().verifyIdentity("AB123456");
    guests.save(verified);
    assertTrue(guests.findById("james").orElseThrow().identityComplete());

    // room occupancy transition
    Room room805 = rooms.findByNumber("805").orElseThrow();
    rooms.save(room805.occupy());
    assertEquals(RoomOccupancy.OCCUPIED, rooms.findByNumber("805").orElseThrow().occupancy());
  }
}
