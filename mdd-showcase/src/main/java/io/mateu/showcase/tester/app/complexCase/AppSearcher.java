package io.mateu.showcase.tester.app.complexCase;

import io.mateu.mdd.core.app.Searcher;
import io.mateu.mdd.util.Helper;
import io.mateu.showcase.tester.model.useCases.bankAccount.BankAccount;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.Found;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter@Setter
public class AppSearcher extends Searcher {

    private String accountName;

    public List<Found> findByAccountName(String text) throws Throwable {
        return ((List<BankAccount>)Helper.selectObjects("select x from " + BankAccount.class.getName() + " x where lower(x.name) like :s", Helper.hashmap("s", "%" + text.toLowerCase() + "%"))).stream().map(x -> new Found(MDDUI.get().getAdaptedUIRootPath() + "public/usecases/usecases/bankaccount/accounts/" + x.getId(), x.getName(), "Bank account " + x.getId() + " " + x.getName())).collect(Collectors.toList());
    }

}
