package com.example.demo.e2e.entities;

import lombok.*;

import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.UUID;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceLineEntity {

    @Id
    private String id = UUID.randomUUID().toString();

    private String description;

    private double amount;


    @Override
    public String toString() {
        return "" + description + "x" + amount;
    }

}
