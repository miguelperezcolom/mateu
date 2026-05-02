package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import java.util.List;

public record Level2View(
        String name,
        List<Level3View> level3) {

    @Override
    public String toString() {
        return name == null?"New Level2":name;
    }

}
