package com.example.demo.infra.ui.menus.layouts;

import com.example.demo.infra.ui.menus.layouts.shared.LeftSideContent;
import com.example.demo.infra.ui.menus.layouts.shared.MyForm1;
import com.example.demo.infra.ui.menus.layouts.shared.RightSideContent;
import com.example.demo.infra.ui.menus.layouts.shared.crud.SimpleCrud;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.Slot;
import io.mateu.core.domain.uidefinition.shared.annotations.SlotName;

import java.util.List;

public class CompleteView {

    @Slot(SlotName.left)
    private LeftSideContent leftSideContent;


    private MyForm1 myForm1;


    @HorizontalLayout
    private List horizontalLayout = List.of(
            new LeftSideContent(),
            new RightSideContent()
    );

    @HorizontalLayout
    private SimpleContainer simpleContainer;

    private SimpleCrud simpleCrud;

    @Slot(SlotName.right)
    private RightSideContent rightSideContent;

}
