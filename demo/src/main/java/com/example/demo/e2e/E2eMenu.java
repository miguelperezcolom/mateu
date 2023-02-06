package com.example.demo.e2e;

import com.example.demo.e2e.cruds.basic.BasicCrud;
import com.example.demo.e2e.cruds.notSoBasic.NotSoBasicCrud;
import com.example.demo.e2e.forms.*;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;

import java.net.MalformedURLException;
import java.net.URL;

public class E2eMenu {

    @Submenu
    private E2eFormsMenu forms;

    @Submenu
    private E2eCrudsMenu cruds;

    @Submenu
    private E2eJpaMenu jpa;

    @MenuOption
    private URL google = new URL("https://www.google.es");

    public E2eMenu() throws MalformedURLException {
    }
}
