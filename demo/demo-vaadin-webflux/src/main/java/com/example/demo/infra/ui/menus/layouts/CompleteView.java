package com.example.demo.infra.ui.menus.layouts;

import com.example.demo.infra.ui.menus.layouts.shared.LeftSideContent;
import com.example.demo.infra.ui.menus.layouts.shared.MyForm1;
import com.example.demo.infra.ui.menus.layouts.shared.RightSideContent;
import com.example.demo.infra.ui.menus.layouts.shared.crud.SimpleCrud;
import io.mateu.uidl.core.annotations.HorizontalLayout;
import io.mateu.uidl.core.annotations.Slot;
import io.mateu.uidl.core.annotations.SlotName;
import io.mateu.uidl.core.annotations.SplitLayout;
import io.mateu.uidl.core.annotations.TabLayout;
import io.mateu.uidl.core.data.Element;
import io.mateu.uidl.core.interfaces.View;

import java.util.List;

public class CompleteView implements View {

    @Slot(SlotName.left)
    private LeftSideContent leftSideContent;

    private MyForm1 myForm1;

    @SplitLayout
    private List splitLayout = List.of(
            new LeftSideContent("Left", "This goes to the left"),
            new RightSideContent("Right", "This goes to the right")
    );

    @HorizontalLayout
    private List horizontalLayout = List.of(
            new LeftSideContent("Left", "This goes to the left"),
            new RightSideContent("Right", "This goes to the right")
    );

    @HorizontalLayout
    private SimpleContainer simpleContainer;

    @TabLayout
    SimpleContainer tabs;


    private SimpleCrud simpleCrud;

    private SimpleCrud anotherCrud;

    @Slot(SlotName.right)
    private RightSideContent rightSideContent;

    @Slot(SlotName.header)
    private Element inHeader = new Element("h2", "Header");

    @Slot(SlotName.footer)
    private Element footer = new Element("h2", "Footer");

    @Slot(SlotName.footer)
    private Element subfooter = new Element("p", "Less important footer content");
}
