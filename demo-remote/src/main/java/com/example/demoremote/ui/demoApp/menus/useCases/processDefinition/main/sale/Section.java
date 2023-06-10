package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.sale;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Section {

    @Id
    String id;

    String title;

    @ManyToOne
    Step step;


    @Override
    public String toString() {
        return title;
    }
}
