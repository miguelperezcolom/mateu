package com.example.demo.infra.ui.menus;

import io.mateu.uidl.annotations.Action;
import org.springframework.stereotype.Service;

@Service
public class RequestTooLong {

    String tooLongContent = "";

    @Action
    public void test() {
        for (int i = 0; i < 4000L; i++) {
            tooLongContent = tooLongContent.concat("0123456789");
        }
    }

}
