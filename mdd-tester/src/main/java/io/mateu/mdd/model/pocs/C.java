package io.mateu.mdd.model.pocs;

import io.mateu.ui.mdd.server.util.Helper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class C {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @OneToMany(mappedBy = "c", cascade = CascadeType.ALL)
    private List<D> ds = new ArrayList<>();


    @PrePersist
    public void pre() {

        setName(getName() + " / " + LocalDateTime.now());

        for (int i = 0; i < 10; i++) {
            ds.add(new D(this));
        }

    }

}
