package com.example.demo.infra.ui.menus.forms;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.HasInitMethod;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.ResultType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
public class MyReadOnlyPojoWithCrudEditor implements HasInitMethod {

    @JsonIgnore
    private final MyReadOnlyPojoData data;

    String id;
    String name;

    public MyReadOnlyPojoWithCrudEditor(MyReadOnlyPojoData data) {
        this.data = data;
    }


    @Action(value = "Save")
    public GoBack save() {
        System.out.println("saved");
        data.setName(name);
        return new GoBack(ResultType.Success, "Saved", this);
    }

    @Override
    public void init(ServerHttpRequest serverHttpRequest) {
        name = data.getName();
    }
}