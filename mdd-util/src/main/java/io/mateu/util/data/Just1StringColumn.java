package io.mateu.util.data;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class Just1StringColumn {

    private String content;

    public Just1StringColumn(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return content;
    }
}
