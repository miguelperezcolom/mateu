package com.example.demo.ddd.infra.in.ui.shell;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Popover;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.WidgetSupplier;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import static io.mateu.core.infra.JsonSerializer.fromJson;

@MateuUI("")
@Style("width: 100%;")
@Title("App")
@FavIcon("/images/favicon.png")
@PageTitle("App")
@Logo("/images/logo.png")
@KeycloakSecured(url = "https://lemur-11.cloud-iam.com/auth", realm = "mateu", clientId = "demo")
public class Home implements WidgetSupplier {

    //@Menu
    //Projects projects;

    @Menu
    RemoteMenu masterData = new RemoteMenu("/master-data", "", "", "com.example.demo.ddd.infra.in.ui.masterdata.MasterDataHome", "", Map.of(), false, null, null);

    @Menu
    RemoteMenu crm = new RemoteMenu("/_crm").withAppServerSideType("com.example.demo.ddd.infra.in.ui.crm.CrmHome");

    @Menu
    RemoteMenu product = new RemoteMenu("/_product").withAppServerSideType("com.example.demo.ddd.infra.in.ui.product.ProductHome");

    @Menu
    RemoteMenu callCenter = new RemoteMenu("/call-center").withAppServerSideType("com.example.demo.ddd.infra.in.ui.callcenter.CallCenterHome");

    @Menu
    RemoteMenu financial = new RemoteMenu("/_financial").withAppServerSideType("com.example.demo.ddd.infra.in.ui.financial.FinancialHome");

    String content = "Hola!";

    @Override
    public List<Component> widgets(HttpRequest httpRequest) {
        if (httpRequest.getHeaderValue("Authorization") != null && httpRequest.getHeaderValue("Authorization").startsWith("Bearer ")) {

            var token = httpRequest.getHeaderValue("Authorization").substring("Bearer ".length());

            var payload = new String(Base64.getDecoder().decode(token.split("\\.")[1]));

            var values = fromJson(payload);

//            var claims = Jwts.parser()
//                    .build()
//                    .parse(token)
//                    .getPayload();

            return List.of(io.mateu.uidl.data.HorizontalLayout.builder().content(List.of(Popover.builder()
                    .wrapped(Text.builder().text("Hola, " + values.get("name"))
                            .style("margin-right: 20px;")
                            .build())
                    .content(io.mateu.uidl.data.VerticalLayout.builder().content(List.of(
                            new Text("Email: " + values.get("email")),
                            new Anchor("Logout", "javascript: window.logout();"))
                    ).spacing(true)
                            .padding(true)
                            .build())
                    .build())).build());
        }
        return List.of();
    }
}
