package io.mateu.mdd.core.app;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data@NoArgsConstructor
public class ColumnAction {

    private String id;

    private String caption;

    private String icon;

    public ColumnAction(String id, String caption, String icon) {
        this.id = id;
        this.caption = caption;
        this.icon = icon;
    }
}
