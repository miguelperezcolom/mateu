package io.mateu.mdd.demofrontoffice.domain.room;

import java.util.List;
import java.util.Optional;

/** Repository port of the {@link Room} aggregate. */
public interface RoomRepository {

  Optional<Room> findByNumber(String number);

  List<Room> findAll();

  List<Room> findByFloor(int floor);

  Room save(Room room);
}
