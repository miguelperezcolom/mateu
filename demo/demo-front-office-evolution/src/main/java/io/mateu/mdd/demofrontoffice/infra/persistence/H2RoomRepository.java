package io.mateu.mdd.demofrontoffice.infra.persistence;

import io.mateu.mdd.demofrontoffice.domain.room.Room;
import io.mateu.mdd.demofrontoffice.domain.room.RoomRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jdbc.core.JdbcAggregateTemplate;
import org.springframework.stereotype.Repository;

/** H2 adapter of the {@link RoomRepository} port. */
@Repository
class H2RoomRepository implements RoomRepository {

  private final RoomCrud crud;
  private final JdbcAggregateTemplate template;

  H2RoomRepository(RoomCrud crud, JdbcAggregateTemplate template) {
    this.crud = crud;
    this.template = template;
  }

  @Override
  public Optional<Room> findByNumber(String number) {
    return crud.findById(number);
  }

  @Override
  public List<Room> findAll() {
    return crud.findAll();
  }

  @Override
  public List<Room> findByFloor(int floor) {
    return crud.findByFloorOrderByNumberAsc(floor);
  }

  @Override
  public Room save(Room room) {
    return crud.existsById(room.number()) ? crud.save(room) : template.insert(room);
  }
}
