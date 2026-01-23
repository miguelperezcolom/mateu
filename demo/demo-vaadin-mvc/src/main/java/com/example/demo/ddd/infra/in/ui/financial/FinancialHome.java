package com.example.demo.ddd.infra.in.ui.financial;

import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;

@MateuUI("/_financial")
@Style("width: 100%;")
@Title("Financial")
@FavIcon("/images/favicon.png")
@PageTitle("Financial")
@Logo("/images/logo.png")
public class FinancialHome {

    @Menu
    FinancialSubmenu financial;

    String content = "Hola!";

}
