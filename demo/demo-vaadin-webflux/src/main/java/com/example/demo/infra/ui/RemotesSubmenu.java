package com.example.demo.infra.ui;

import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.data.RemoteMenu;

public class RemotesSubmenu {

    @MenuOption(remote = true)
    String remoteMenu = "https://article2.mateu.io/booking";

    @MenuOption
    RemoteMenu anotherRemoteMenu = new RemoteMenu("https://article2.mateu.io/financial/menu_financial_invoices", "");

    @MenuOption(remote = true)
    String remoteBrokenMenu = "https://demo.mateu.io/xxxxx/cruds";

}
