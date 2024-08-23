package io.mateu.demo.complexview;

import io.mateu.core.domain.uidefinition.core.interfaces.*;
import lombok.Getter;


@Getter
public class SimpleCard implements HasTitle, HasSubtitle, HasContent {

    String title = "Card title";
    String subtitle = "Card subtitle";
    String content = "Card description";

}
