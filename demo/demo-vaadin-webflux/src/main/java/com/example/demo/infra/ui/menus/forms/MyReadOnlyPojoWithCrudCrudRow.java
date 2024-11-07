package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Detail;
import io.mateu.uidl.core.annotations.Width;

public record MyReadOnlyPojoWithCrudCrudRow(
        @Width("300px") String name, int age, @Detail String longText
) {
}
