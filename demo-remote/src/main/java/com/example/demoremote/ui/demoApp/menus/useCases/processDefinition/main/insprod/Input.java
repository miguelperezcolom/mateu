package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Input {

    @Id
    @Column(name = "_key")
    String key;
    @ManyToOne
    Journey journey;
    String type;
    String label;
    @ElementCollection
    List<String> validations = new ArrayList<>();

    @Override
    public String toString() {
        return label;
    }

}
