package io.mateu.mdd.tester.model.entities.basic;

import com.vaadin.ui.Button;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.SameLine;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class CustomFieldsPOJO {

    private String name;

    private int age;

    private String city;

    @SameLine
    private Button button = new Button("Fill rest of fields", e -> {
        setState("Baleares");
        setCountry("Spain");
        setTelephone("+34 629 60 21 88");
        setEmail("miguelperezcolom@gmail.com");

        MDD.refreshUI();
    });


    private String state;

    private String country;

    private String telephone;

    private String email;



}
