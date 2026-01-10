package com.example.demo.ddd.infra.in.ui.crm;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Agencies;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;

@MateuUI("/crm")
@Style("width: 100%;")
@Title("CRM")
@FavIcon("/images/favicon.png")
@PageTitle("CRM")
@Logo("/images/logo.png")
public class CrmHome {

    @Menu
    Agencies agencies;

    String content = "Hola!";

}
