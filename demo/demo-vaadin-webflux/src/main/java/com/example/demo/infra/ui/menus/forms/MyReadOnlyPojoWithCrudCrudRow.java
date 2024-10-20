package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Detail;
import io.mateu.core.domain.uidefinition.shared.annotations.Width;

public record MyReadOnlyPojoWithCrudCrudRow(
        @Width("300px") String name, int age, @Detail String longText
) {
}
