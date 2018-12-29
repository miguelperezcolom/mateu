package io.mateu.mdd.tester.model.useCases.triggers;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter
public class Product {

    @Id@GeneratedValue
    private long id;

    @NotEmpty
    private String name;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @OrderColumn(name = "_order")
    private List<Part> parts = new ArrayList<>();


    @OrderBy("id")
    private List<LogRecord> log = new ArrayList<>();


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
        System.out.println("producto total ahora es " + value);
    }
}
