package com.example.demo.infra.ui.menus.layouts;

import com.example.demo.infra.ui.menus.layouts.shared.LeftSideContent;
import com.example.demo.infra.ui.menus.layouts.shared.RightSideContent;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;

import java.util.List;

public class VerticalLayoutForm implements Container {

    @VerticalLayout
    private List horizontalLayout = List.of(
            new LeftSideContent("Left", "This goes to the left"),
            new RightSideContent("Right", "This goes to the right")
    );

}
