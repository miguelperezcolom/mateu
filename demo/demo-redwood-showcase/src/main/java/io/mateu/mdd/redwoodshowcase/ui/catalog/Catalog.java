package io.mateu.mdd.redwoodshowcase.ui.catalog;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

enum RoomStatus {
    Available,
    Occupied,
    Maintenance
}

record Room(
        @Section(value = "Room", columns = 4)
        @NotEmpty @EditableOnlyWhenCreating String id,
        @NotEmpty String name,
        @NotNull RoomType type,
        @NotNull
        @Status(
                defaultStatus = StatusType.NONE,
                mappings = {
                        @StatusMapping(from = "Available", to = StatusType.SUCCESS),
                        @StatusMapping(from = "Occupied", to = StatusType.INFO),
                        @StatusMapping(from = "Maintenance", to = StatusType.WARNING)
                })
        RoomStatus status,
        LocalDate availableFrom,
        @RangeFilter
        @Stereotype(FieldStereotype.money)
        double pricePerNight,
        @Stereotype(FieldStereotype.textarea)
        @HiddenInList
        String notes)
        implements Identifiable {

    @Override
    public String toString() {
        return name != null ? name : "New room";
    }
}

enum RoomType {
    Single,
    Double,
    Suite,
    Penthouse
}

class RoomStore implements CrudStore<Room> {

    private static final Map<String, Room> db = seed();

    private static Map<String, Room> seed() {
        Map<String, Room> map = new HashMap<>();
        String[] names = {"Garden", "Ocean", "Sky", "Terrace", "Loft", "Patio", "Marina", "Cliff"};
        for (int i = 1; i <= 48; i++) {
            String id = String.format("R-%03d", i);
            RoomType type = RoomType.values()[i % RoomType.values().length];
            RoomStatus status = RoomStatus.values()[i % RoomStatus.values().length];
            map.put(
                    id,
                    new Room(
                            id,
                            names[i % names.length] + " " + i,
                            type,
                            status,
                            LocalDate.of(2026, 1, 1).plusDays(i),
                            80.0 + i * 7.5,
                            "Comfortable " + type.name().toLowerCase() + " room."));
        }
        return map;
    }

    @Override
    public Optional<Room> findById(String id) {
        return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(Room entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Room> findAll() {
        return db.values().stream().sorted((a, b) -> a.id().compareTo(b.id())).toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}

@UI("/catalog")
@Title("Rooms")
public class Catalog extends AutoCrud<Room> {

    @Override
    public CrudStore<Room> store() {
        return new RoomStore();
    }
}
