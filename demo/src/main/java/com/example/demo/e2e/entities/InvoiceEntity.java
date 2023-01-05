package com.example.demo.e2e.entities;

import io.mateu.mdd.shared.annotations.KPI;
import lombok.*;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "number")
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceEntity {

    @Id
    private String id;

    @Embedded
    private AddressEntity address;

    @OneToMany(cascade = CascadeType.ALL)
    private List<InvoiceLineEntity> lines = new ArrayList<>();

    public void setLines(List<InvoiceLineEntity> lines) {
        this.lines = lines;
        if (lines == null) {
            total = 0;
        } else {
            total = lines.stream().map(l -> l.getAmount()).reduce(0d, Double::sum);
        }
    }

    @KPI
    private double total;

    @Override
    public String toString() {
        return id;
    }

}
