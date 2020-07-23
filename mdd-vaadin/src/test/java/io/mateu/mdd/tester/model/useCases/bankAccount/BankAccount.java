package io.mateu.mdd.tester.model.useCases.bankAccount;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.authentication.Audit;
import io.mateu.mdd.core.util.Helper;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Version
    private int version;

    @Embedded
    @Output
    private Audit audit;

    @ManyToOne@NotNull
    @Unmodifiable
    private final Bank bank;

    @NotEmpty
    private String name;

    @Keep
    private String searchableContent;

    @KPI
    @Sum
    private double balance;

    @UseLinkToListView(addEnabled = false, deleteEnabled = false)
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "account")
    private List<BankAccountComment> comments = new ArrayList<>();


    @Override
    public String toString() {
        return getName();
    }


    @Action(order = 3, icon = VaadinIcons.EDIT, saveAfter = true)
    @NotWhenCreating
    public void addComment(@NotEmpty String text) {
        if (!Strings.isNullOrEmpty(text)) {
            BankAccountComment c = new BankAccountComment();
            c.setAccount(this);
            c.setText(text);
            getComments().add(c);
            //setComments(new ArrayList<>(getComments()));
        }
    }

    @Action(order = 5, icon = VaadinIcons.EDIT, saveAfter = true)
    public Component testComponente() {
        return new VerticalLayout(
                new Label("Hola!")
                , new Button("Abrir", e -> {
            try {
                MDD.edit(Helper.find(BankAccount.class, 1l));
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        })
        )
                ;
    }

    @Action(order = 4, icon = VaadinIcons.EDIT, saveAfter = true)
    public static Set<BankAccount> testLista(Set<BankAccount> seleccion) {
        return seleccion;
    }

}
