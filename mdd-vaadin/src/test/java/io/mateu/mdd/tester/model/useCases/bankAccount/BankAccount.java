package io.mateu.mdd.tester.model.useCases.bankAccount;

import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.authentication.Audit;
import io.mateu.mdd.core.model.authentication.User;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.collections.ArrayStack;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Getter@Setter
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
    private Bank bank;

    @NotEmpty
    private String name;

    @Keep
    private String searchableContent;

    @Output
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

    @Action(order = 4, icon = VaadinIcons.EDIT, saveAfter = true)
    public static Set<BankAccount> testLista(Set<BankAccount> seleccion) {
        return seleccion;
    }

}
