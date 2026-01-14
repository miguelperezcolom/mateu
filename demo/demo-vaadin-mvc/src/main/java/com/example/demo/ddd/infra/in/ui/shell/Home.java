package com.example.demo.ddd.infra.in.ui.shell;

import com.example.demo.ddd.infra.in.ui.callcenter.CallCenterSubmenu;
import com.example.demo.ddd.infra.in.ui.financial.FinancialSubmenu;
import com.example.demo.ddd.infra.in.ui.masterdata.MasterDataMenu;
import com.example.demo.ddd.infra.in.ui.product.ProductSubmenu;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Agencies;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.RemoteMenu;

import java.util.Map;

@MateuUI("")
@Style("width: 100%;")
@Title("App")
@FavIcon("/images/favicon.png")
@PageTitle("App")
@Logo("/images/logo.png")
public class Home {

    //@Menu
    //Projects projects;

    @Menu
    RemoteMenu masterData = new RemoteMenu("/master-data", "", "", "com.example.demo.ddd.infra.in.ui.masterdata.MasterDataHome", "", Map.of(), false, null, null);

    @Menu
    RemoteMenu crm = new RemoteMenu("/crm");

    @Menu
    RemoteMenu product = new RemoteMenu("/product");

    @Menu
    RemoteMenu callCenter = new RemoteMenu("/call-center");

    @Menu
    RemoteMenu financial = new RemoteMenu("/financial");

    String content = "Hola!";

}
