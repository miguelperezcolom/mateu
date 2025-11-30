package com.example.demo.ddd.pages.project.decisions;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;

@Title("Decisions")
@Route(value = "/projects/[^/]+/decisions", parentRoute = "/projects/[^/]+$")
public class Decisions {
}
