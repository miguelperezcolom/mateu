package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.Detail;
import io.mateu.uidl.annotations.Width;

public record MyReadOnlyPojoWithCrudCrudRow(
        @Width("300px") String name, int age, @Detail String longText
) {
}
