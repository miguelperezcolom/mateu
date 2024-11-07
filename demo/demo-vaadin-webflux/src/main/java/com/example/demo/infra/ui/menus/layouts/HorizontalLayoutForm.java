package com.example.demo.infra.ui.menus.layouts;

import com.example.demo.infra.ui.menus.layouts.shared.LeftSideContent;
import com.example.demo.infra.ui.menus.layouts.shared.RightSideContent;
import io.mateu.uidl.core.interfaces.Container;
import io.mateu.uidl.core.annotations.HorizontalLayout;

import java.util.List;

public class HorizontalLayoutForm implements Container {

    @HorizontalLayout
    private List horizontalLayout = List.of(
            new LeftSideContent("Left", "This goes to the left"),
            new RightSideContent("Right", "This goes to the right")
    );

}
