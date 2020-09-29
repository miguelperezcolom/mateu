package io.mateu.mdd.shared.interfaces;

import java.util.List;

public interface IModule {
    List<MenuEntry> getMenu();

    String getName();

    IArea getArea();
}
