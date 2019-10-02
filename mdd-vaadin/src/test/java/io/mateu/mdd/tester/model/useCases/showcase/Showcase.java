package io.mateu.mdd.tester.model.useCases.showcase;

import io.mateu.mdd.core.annotations.Section;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter
public class Showcase {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Section("Básicos")
    @NotEmpty
    private String name;

    private String opcional;

    private int entero;

    private long largo;

    private double doble;

    private boolean booleano;

    private Integer enteroo;

    private Long largoo;

    private Double dobleo;

    private Boolean booleanoo;

    @Section("A uno")
    @ManyToOne
    private MuchosAUno muchosAUno;

    @OneToOne
    private UnoAUno unoAUno;

    @OneToOne(mappedBy = "showcase")
    private UnoAUnoMapped unoAUnoMapped;

    @Section("A muchos")
    @OneToMany(cascade = CascadeType.ALL)
    private List<UnoAMuchos> unoAMuchos = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "showcase")
    private List<UnoAMuchosMapped> unoAMuchosMapped;




}
