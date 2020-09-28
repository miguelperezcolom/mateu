package io.mateu.mdd.vaadinport.vaadin.components.views;

import io.mateu.reflection.FieldInterfaced;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class FormLayoutGroup {

    private String caption;

    private List<FieldInterfaced> fields = new ArrayList<>();

    public FormLayoutGroup(String caption) {
        this.caption = caption; 
    }
}
