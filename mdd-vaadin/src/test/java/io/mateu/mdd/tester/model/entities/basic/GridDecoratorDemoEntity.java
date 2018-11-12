package io.mateu.mdd.tester.model.entities.basic;

import com.vaadin.ui.Grid;
import com.vaadin.ui.StyleGenerator;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.interfaces.GridDecorator;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class GridDecoratorDemoEntity implements GridDecorator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField;

    private int intField;


    @Override
    public void decorateGrid(Grid grid) {
        grid.getColumn("stringField").setStyleGenerator(new StyleGenerator() {
            @Override
            public String apply(Object o) {
                return (((Integer)((Object[])o)[3]) > 20)?"green":"";
            }
        });
    }
}
