package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Journey {

    @Id
    @Column(name = "_key")
    @NotBlank@NotNull
    String key;

    @ManyToOne@NotNull
    Product product;


    @Override
    public String toString() {
        return key;
    }

}
