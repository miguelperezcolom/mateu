package com.example.demo.ddd.infra.in.ui.project;

import com.example.demo.ddd.infra.in.ui.callcenter.CallCenterSubmenu;
import com.example.demo.ddd.infra.in.ui.financial.FinancialSubmenu;
import com.example.demo.ddd.infra.in.ui.masterdata.MasterDataMenu;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Agencies;
import com.example.demo.ddd.infra.in.ui.product.ProductSubmenu;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;

@MateuUI("/booking")
@Style("width: 100%;")
@Title("App")
@FavIcon("/images/favicon.png")
@PageTitle("My app")
@Logo("/images/logo.png")
public class ProjectHome {

    //@Menu
    //Projects projects;

    @Menu
    MasterDataMenu masterData;

    @Menu
    Agencies agencies;

    @Menu
    ProductSubmenu product;

    @Menu
    CallCenterSubmenu callCenter;

    @Menu
    FinancialSubmenu financial;

    String content = "Hola!";

}
