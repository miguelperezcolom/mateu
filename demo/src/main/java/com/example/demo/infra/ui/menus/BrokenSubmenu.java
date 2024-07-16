package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.errors.rpcTimeouts.BrokenCrud;
import io.mateu.mdd.shared.annotations.MenuOption;

public class BrokenSubmenu {

  @MenuOption private BrokenCrud brokenCrud;
}
