package io.mateu.mdd.vaadin.components.views;

import io.mateu.mdd.shared.annotations.Height;
import io.mateu.mdd.shared.annotations.TextArea;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter@NoArgsConstructor@AllArgsConstructor
public class TextAreaFieldModel {

    @TextArea@Height("600px")
    private String text;

}
