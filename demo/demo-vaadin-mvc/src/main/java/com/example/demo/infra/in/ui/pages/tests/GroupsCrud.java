package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Routes;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

record Miembro(@NotEmpty String id, @NotEmpty String nombre, @Hidden("!state['miembros-nombre']") String email) {

}

record Grupo(@NotEmpty String id, @NotEmpty String nombre, @Colspan(2)@Hidden("!state.nombre") String email, @Colspan(2) List<Miembro> miembros) implements Identifiable {

    @Override
    public String toString() {
        return nombre != null?nombre:"Nuevo grupo";
    }
}

class Adapter extends AutoCrudAdapter<Grupo> implements CrudRepository<Grupo> {

    static Map<String, Grupo> db = new HashMap<>();

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
@Trigger(type = TriggerType.OnLoad, actionId = "refresh", timeoutMillis = 4000)
public class GroupsCrud extends AutoCrudOrchestrator<Grupo> {
    @Override
    public AutoCrudAdapter<Grupo> simpleAdapter() {
        return new Adapter();
    }

    public void refresh() {
        System.out.println("refresh!");
    }

    @Override
    public List<io.mateu.uidl.fluent.Trigger> triggers(HttpRequest httpRequest) {
        List<io.mateu.uidl.fluent.Trigger> triggers = new ArrayList<>(super.triggers(httpRequest));
        triggers.add(new OnLoadTrigger("search", 6000, 1, ""));
        return triggers;
    }
}
