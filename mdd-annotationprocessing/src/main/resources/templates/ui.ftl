package com.example.demo;
import com.example.demo.MyUI;
import com.vaadin.annotations.JavaScript;
import com.vaadin.annotations.Push;
import com.vaadin.annotations.StyleSheet;
import com.vaadin.annotations.Theme;
import com.vaadin.annotations.Viewport;
import io.mateu.mdd.vaadin.MateuUI;
import com.vaadin.annotations.JavaScript;
import com.vaadin.navigator.PushStateNavigation;
import lombok.extern.slf4j.Slf4j;


@Theme("mateu")
@JavaScript({"https://code.jquery.com/jquery-3.4.1.min.js"})
@JavaScript({"https://use.fontawesome.com/releases/v5.15.4/js/all.js"})
@JavaScript({"../../VAADIN/js/include.js"})
@Viewport("width=device-width, initial-scale=1")
@PushStateNavigation // para urls sin #!
@Push(transport = com.vaadin.shared.ui.ui.Transport.LONG_POLLING)
@Slf4j

@StyleSheet("../../VAADIN/estilo.css")
public class MyUIUI extends MateuUI {

}
