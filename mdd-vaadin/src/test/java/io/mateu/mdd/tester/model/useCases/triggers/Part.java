package io.mateu.mdd.tester.model.useCases.triggers;

import io.mateu.mdd.core.util.Helper;
import lombok.Getter;
import lombok.Setter;
import org.eclipse.persistence.sessions.UnitOfWork;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Entity@Getter@Setter
public class Part {

    @Id@GeneratedValue
    private long id;

    @ManyToOne@NotNull
    private Product product;

    @NotEmpty
    private String name;

    private double value;

    public void setValue(double value) {
        this.value = value;
        product.setUpdatePendiente(true);
    }

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        System.out.println("Part.preUpdate()");
        /*
        UnitOfWork uow = Helper.getEMFromThreadLocal().unwrap(UnitOfWork.class);
        Product p = (Product) uow.registerObject(product);
        p.setAux("Hola desde el preupdate del Part");
        // Helper.getEMFromThreadLocal().merge(product); // no funcionó

        //uow.registerObject(product); // no funcionó
        //uow.registerExistingObject(product); // no funcionó
        */
    }
}
