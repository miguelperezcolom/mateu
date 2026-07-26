package io.mateu.mdd.demofrontoffice.domain.room;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;

/**
 * Room aggregate root — physical inventory: occupancy, housekeeping state and open maintenance
 * notes. Room assignment during check-in reads from here ({@code assignable()}).
 */
public record Room(
    @Id @Column("room_number") String number,
    int floor,
    String type,
    RoomOccupancy occupancy,
    HousekeepingStatus housekeeping,
    String maintenanceNote) {

  public Room {
    if (number == null || number.isBlank())
      throw new IllegalArgumentException("Room number is required");
  }

  /** A room can be assigned when it is free — a maintenance note only warns, it does not block. */
  public boolean assignable() {
    return occupancy == RoomOccupancy.FREE;
  }

  public Room occupy() {
    if (occupancy == RoomOccupancy.OCCUPIED) throw new IllegalStateException("Room already occupied");
    return new Room(number, floor, type, RoomOccupancy.OCCUPIED, housekeeping, maintenanceNote);
  }

  public Room release() {
    return new Room(number, floor, type, RoomOccupancy.FREE, HousekeepingStatus.DIRTY, maintenanceNote);
  }

  public Room housekeepingDone(HousekeepingStatus status) {
    return new Room(number, floor, type, occupancy, status, maintenanceNote);
  }

  public Room reportMaintenance(String note) {
    return new Room(number, floor, type, occupancy, housekeeping, note);
  }

  public Room maintenanceFixed() {
    return new Room(number, floor, type, occupancy, housekeeping, null);
  }
}
