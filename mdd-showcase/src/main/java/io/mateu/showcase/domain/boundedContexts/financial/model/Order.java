package io.mateu.showcase.domain.boundedContexts.financial.model;

import io.mateu.showcase.domain.boundedContexts.common.model.Person;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.util.List;

@MateuMDDEntity
public class Order {

    @ManyToOne@NotNull
    private Person recipient;

    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderLine> lines;

    private double total;

    @NotNull
    private OrderStatus status = OrderStatus.Pending;

}
