package io.mateu.mdd.shared.data;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class SumData {

    private String title;

    private String value;

    private String style;

    public SumData(String title, String value, String style) {
        this.title = title;
        this.value = value;
        this.style = style;
    }
}
