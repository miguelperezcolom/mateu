package io.mateu.mdd.tester.model.useCases.hotel;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
public class Hotel {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private String name;


    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<Room> rooms = new ArrayList<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<Offer> offers = new ArrayList<>();


    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<Contract> contracts = new ArrayList<>();

}
