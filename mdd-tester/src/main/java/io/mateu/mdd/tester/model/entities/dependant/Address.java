package io.mateu.mdd.tester.model.entities.dependant;

import com.vaadin.data.provider.DataProvider;
import io.mateu.mdd.core.annotations.DependsOn;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.dataProviders.JPQLListDataProvider;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class Address {

    @Id@GeneratedValue
    private long id;

    @ManyToOne
    @NotNull
    private Country country;

    @ManyToOne
    @NotNull
    private State state;

    @ManyToOne
    @NotNull
    private City city;

    @NotEmpty
    private String name;

    @TextArea@NotEmpty
    private String text;


    @Override
    public String toString() {
        return getName();
    }


    public void setCity(City city) {
        this.city = city;
        if (city != null) {
            setState(city.getState());
            setCountry(city.getState().getCountry());
        }
    }



    public DataProvider getStateDataProvider(MDDBinder binder) throws Throwable {
        DataProvider dp = new JPQLListDataProvider("select x from " + State.class.getName() + " x " + ((getCountry() != null)?" where x.country.id = " + getCountry().getId():""));
        binder.addValueChangeListener(e -> {
            if (e.isUserOriginated() && e.getValue() != null && e.getValue() instanceof Country) {
                ((JPQLListDataProvider) dp).refresh("select x from " + State.class.getName() + " x " + ((e.getValue() != null)?" where x.country.id = " + ((Country)e.getValue()).getId():""));
                setState(null);
            }
        });
        return dp;
    }



    @DependsOn("state")
    public DataProvider getCityDataProvider() throws Throwable {
        return new JPQLListDataProvider("select x from " + City.class.getName() + " x " + ((getState() != null)?" where x.state.id = " + getState().getId():""));
    }
}
