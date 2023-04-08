package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;

@Getter@Setter
@Caption("Url and text")
public class UrlAndTextForm {

    @Placeholder("Google")
    private URL url = new URL("https://www.google.es");

    @RawContent
    private String someMessage = """
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
nisi ut aliquip ex ea commodo consequat.
""";



    @Section(value = "", card = false)
    @RawContent
    private String anotherMessage = """
Lorem ipsum dolor sit amet, <b>consectetur adipiscing elit</b>, sed do eiusmod tempor incididunt ut 
labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
nisi ut aliquip ex ea commodo consequat.
""";


    public UrlAndTextForm() throws MalformedURLException {
    }
}
