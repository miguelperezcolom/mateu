package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@ReadOnly
@Scope("prototype")
public class ProcessView implements TriggersSupplier {

    final ProcessRepository repository;

    String id;

    String name;

    int count;

    public ProcessView load(String id) {
        this.id = id;
        repository.findById(id).ifPresent(p -> {name = p.name();});
        return this;
    }

    @Action
    Object refresh() {
        count++;
        return new State(this);
    }

    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        var triggers = new ArrayList<Trigger>();
        triggers.add(new OnLoadTrigger("refresh", 500, 1, "state.count < 10"));
        triggers.add(new OnSuccessTrigger("refresh", "refresh", "state.count < 10", 300));
        return triggers;
    }
}
