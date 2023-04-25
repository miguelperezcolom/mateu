package io.mateu.mdd.core.app;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data@NoArgsConstructor
public class ColumnAction {

    private String methodNameInCrud;

    private String caption;

    private String icon;

    public ColumnAction(String methodNameInCrud, String caption, String icon) {
        this.methodNameInCrud = methodNameInCrud;
        this.caption = caption;
        this.icon = icon;
    }
}
