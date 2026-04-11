package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.MappedValue;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Routes;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.ValueMapping;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import lombok.SneakyThrows;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

record Miembro(@NotEmpty String id, @NotEmpty String nombre, @Hidden("!state['miembros-nombre']") String email) {

}

record Grupo(@NotEmpty String id,
             @NotEmpty String nombre,
             @Status(defaultStatus = StatusType.NONE, mappings = {
                     @StatusMapping(from = "si", to = StatusType.SUCCESS),
                     @StatusMapping(from = "no", to = StatusType.DANGER),
             })
             String status,
             @MappedValue(defaultValue = "x", mappings = {
                     @ValueMapping(from = "true", to = "si!!!"),
                     @ValueMapping(from = "false", to = "no!!!!"),
             })
             boolean main,
             @Colspan(2)@Hidden("!state.nombre") String email,
             @Colspan(2) List<Miembro> miembros) implements Identifiable {

    @Override
    public String toString() {
        return nombre != null?nombre:"Nuevo grupo";
    }
}

class Adapter extends AutoCrudAdapter<Grupo> implements CrudRepository<Grupo> {

    static Map<String, Grupo> db = new HashMap<>(Map.of(
            "1", new Grupo("1", "Test", "si", true, "miguel@test.com", List.of())
    ));

    @Override
    public CrudRepository<Grupo> repository() {
        return this;
    }

    @Override
    public Optional<Grupo> findById(String id) {
        return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Grupo entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Grupo> findAll() {
        return db.values().stream().toList();
    }

}

@Route(value = "/home/grupos")
//@Trigger(type = TriggerType.OnLoad, actionId = "search", timeoutMillis = 4000, times = -1)
public class GroupsCrud extends AutoCrudOrchestrator<Grupo> {
    @Override
    public AutoCrudAdapter<Grupo> simpleAdapter() {
        return new Adapter();
    }

    @SneakyThrows
    @ListToolbarButton(confirmationRequired = false)
    public Object refresh(List<Grupo> seleccion) {
        System.out.println("refresh!" + seleccion);
        Thread.sleep(2000);
        return Message.builder().text("Hola " + seleccion).build();
    }

}
