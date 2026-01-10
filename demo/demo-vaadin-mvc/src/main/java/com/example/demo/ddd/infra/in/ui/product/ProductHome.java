package com.example.demo.ddd.infra.in.ui.product;

import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;

@MateuUI("/product")
@Style("width: 100%;")
@Title("Product")
@FavIcon("/images/favicon.png")
@PageTitle("Product")
@Logo("/images/logo.png")
public class ProductHome {

    @Menu
    ProductSubmenu product;

    String content = "Hola!";

}
