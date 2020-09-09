package io.mateu.showcase.tester.model.tests.mappings.maps.c10BasicEntityTransient;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@MateuMDDEntity
public class C10Parent {

    private transient Map<String, C10Son> sons = new HashMap<>();

    @PrePersist@PreUpdate
    public void beforeSave() {
        data = sons.entrySet().stream().map(e -> new C10Row(this, e.getKey(), e.getValue())).collect(Collectors.toList());
    }

    @PostLoad
    public void afterLoad() {
        sons = data.stream().collect(Collectors.toMap(C10Row::getKey, C10Row::getValue));
    }

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "parent")@JsonIgnore
    private List<C10Row> data = new ArrayList<>();

}
