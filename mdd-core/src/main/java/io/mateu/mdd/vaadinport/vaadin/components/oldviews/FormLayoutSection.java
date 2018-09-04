package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import io.mateu.mdd.core.reflection.FieldInterfaced;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class FormLayoutSection {

    private final boolean card;
    private String caption;

    private List<FieldInterfaced> fields = new ArrayList<>();

    public FormLayoutSection(String caption, boolean card) {
        this.caption = caption; 
        this.card = card;
    }
}
