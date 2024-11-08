package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Scope("prototype")
@Slf4j
@Getter@Setter
@ReadOnly
public class AutoReloadForm {

    int cycles;

    String output = "Will reload each second, for 5 times";

    @Action(visible = false, timeoutMillis = 1000)
    Object reload() {

        if (cycles > 5) {
            return "Done";
        }

        cycles++;
        output = "reloaded " + cycles + " times. " + LocalDateTime.now();
        return this;
    }

}
