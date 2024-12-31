package com.example.demo.infra.ui;

import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.data.RemoteMenu;

public class RemotesSubmenu {

    @MenuOption(remote = true)
    String remoteMenu = "/remoteapp#cruds";

    @MenuOption
    RemoteMenu anotherRemoteMenu = new RemoteMenu("/remoteapp#cruds", "");

    @MenuOption(remote = true)
    String remoteBrokenMenu = "https://demo.mateu.io/xxxxx/#cruds";

}
