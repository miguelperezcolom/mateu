package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.sale;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Variable {

    @Id
    String id;

    @ManyToOne
    Flow process;

    @Column(name = "_key")
    String key;

    @Column(name = "_value")
    String value;

    @Override
    public String toString() {
        return key;
    }
}
