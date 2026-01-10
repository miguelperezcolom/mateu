package com.example.demo.ddd.infra.in.ui.masterdata;

import com.example.demo.ddd.infra.in.ui.callcenter.CallCenterSubmenu;
import com.example.demo.ddd.infra.in.ui.financial.FinancialSubmenu;
import com.example.demo.ddd.infra.in.ui.product.ProductSubmenu;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Agencies;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;

@MateuUI("/master-data")
@Style("width: 100%;")
@Title("Master data")
@FavIcon("/images/favicon.png")
@PageTitle("Master data")
@Logo("/images/logo.png")
public class MasterDataHome {

    //@Menu
    //Projects projects;

    @Menu
    MasterDataMenu masterData;

    String content = "Hola!";

}
