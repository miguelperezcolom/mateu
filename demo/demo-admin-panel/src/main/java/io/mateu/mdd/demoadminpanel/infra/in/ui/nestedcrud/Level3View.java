package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import java.util.List;

public record Level3View(
        String name,
        List<Level4View> level4
) {

    @Override
    public String toString() {
        return name == null?"New Level3":name;
    }


}
