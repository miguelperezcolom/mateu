package io.mateu.mdd.tester.model.basic;

import io.mateu.mdd.core.annotations.Section;
import io.mateu.mdd.core.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class SectionDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private String f0 = "zzzz";

    private String f1 = "zzzz";

    private String f2 = "zzzz";

    private String f3 = "zzzz";

    private String f4 = "zzzz";

    private String f5 = "zzzz";

    private String f6 = "zzzz";

    private String f7 = "zzzz";

    private String f8 = "zzzz";

    private String f9 = "zzzz";

    private String f10 = "zzzz";

    @Section("Section 2")
    private String f11 = "zzzz";

    private String f12 = "zzzz";

    private String f13 = "zzzz";

    private String f14 = "zzzz";

    private String f15 = "zzzz";

    private String f16 = "zzzz";

    private String f17 = "zzzz";

    @Section("Section 3")
    private String f18 = "zzzz";

    private String f19 = "zzzz";

    private String f20 = "zzzz";

    private String f21 = "zzzz";

    private String f22 = "zzzz";

    private String f23 = "zzzz";


}
