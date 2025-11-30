package com.example.demo.ddd.pages.project.workflows;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;

@Title("Workflows")
@Route(value = "/projects/[^/]+/workflows", parentRoute = "/projects/[^/]+$")
public class Workflows {
}
