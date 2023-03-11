package com.example.demoremote;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.TextArea;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@MateuUI(path = "")
@Data
public class MyForm {

    private String name = "Mateu";

    private int age;

    @TextArea
    private String text = """
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel semper libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.
                        
            Proin volutpat, sapien ut facilisis ultricies, eros purus blandit velit, at ultrices mi libero quis ante. Curabitur scelerisque metus et libero convallis consequat. Pellentesque feugiat pulvinar nisl sed pellentesque.
            """;

    private LocalDate date;

    private LocalDateTime dateAndTime;

    private LocalTime time;

    private boolean check;

    @ReadOnly
    private String assessment;


    @Action
    public void assess() {
        assessment = "" + name
                + ", " + age
                + ", " + text
                + ", " + date
                + ", " + dateAndTime
                + ", " + time
                + ", " + check
        ;
    }

    public String toString() {
        return "This is a sample form";
    }

}
