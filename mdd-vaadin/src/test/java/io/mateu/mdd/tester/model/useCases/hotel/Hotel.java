package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.UseLinkToListView;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Getter@Setter
public class Hotel {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private String name;


    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<Allotment> allotment = new ArrayList<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<Room> rooms = new ArrayList<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    @UseLinkToListView(addEnabled = true, deleteEnabled = true)
    private List<Board> boards = new ArrayList<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<AbstractOffer> offers = new ArrayList<>();


    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL)
    private List<Contract> contracts = new ArrayList<>();

    public List<AbstractOffer> getContractsOffersValues() {
        return getOffers();
    }


    @Action
    public void sendRooming(String postscript) {
        System.out.println("send rooming with " + postscript + " for " + getName());
    }


    @Action
    public static void sendRooming(String postscript, Set<Hotel> selection) {
        System.out.println("send rooming with " + postscript + " for " + selection.size() + " hotels");
    }



    @Override
    public String toString() {
        return name != null?name:"Hotel " + getId();
    }

}
