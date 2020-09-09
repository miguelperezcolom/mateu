package io.mateu.showcase.tester.model.useCases.triggers;

import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
@Slf4j
public class Product {

    @Id@GeneratedValue
    private long id;

    @NotEmpty
    private String name;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @OrderColumn(name = "_order")
    private List<Part> parts = new ArrayList<>();


    @OrderBy("id")
    private List<LogRecord> _log = new ArrayList<>();


    private String aux;

    private double value;

    private boolean updatePendiente;


    @PrePersist@PreUpdate
    public void preUpdate() {
        aux = "Hola desde preupdate";
        if (updatePendiente) updateValue();
        updatePendiente = false;
    }

    @PostPersist@PostUpdate
    public void postUpdate() {
        aux = "Hola desde postupdate"; // no se graba, pero queda en el objeto que hay en la L2 caché
    }


    public void updateValue() {
        double total = parts.stream().mapToDouble(p -> p.getValue()).sum();
        setValue(total);
        log.debug("producto total ahora es " + value);
    }
}
