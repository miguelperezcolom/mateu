package com.example.demo.ddd.pages.project;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.CommandSupplier;
import io.mateu.uidl.interfaces.ContentSupplier;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.RouteSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
@Route("/projects/[^/]+$")
public class ProjectDetail implements CommandSupplier, PostHydrationHandler, RouteSupplier, ContentSupplier {

    final BeanProvider beanProvider;
    final ProjectEditor editor;
    final ProjectInfo info;
    final ProjectApp app;

    String id;

    @Toolbar
    Object list() {
        return UICommand.navigateTo("projects");
        //return beanProvider.getBean(Projects.class);
    }

    @Toolbar
    Object edit() {
        return editor;
    }

    VerticalLayout content;

    public Object load(String id) {
        this.id = id;
        content = VerticalLayout.of(
                info.load(id),
                app.load(id)
        );
        return this;
    }

    @Override
    public List<UICommand> commands(HttpRequest httpRequest) {
        if (httpRequest.runActionRq().route().endsWith("projects")) {
            return List.of(UICommand.pushStateToHistory(httpRequest.runActionRq().route() + "/" + id));
        }
        return List.of();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        load(httpRequest.runActionRq().route().split("/")[2]);
    }

    @Override
    public String route() {
        return "/projects/" + id;
    }

    @Override
    public Collection<Component> content() {
        return List.of(content);
    }
}
