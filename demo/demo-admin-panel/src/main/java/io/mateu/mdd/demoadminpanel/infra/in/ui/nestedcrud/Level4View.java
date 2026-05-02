package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

public record Level4View(
        String name,
        int age
) {

    @Override
    public String toString() {
        return name == null?"New Level4":name;
    }

}
