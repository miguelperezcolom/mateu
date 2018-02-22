package io.mateu.mdd.model.finnancials;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.Pair;
import io.mateu.ui.mdd.server.annotations.*;
import io.mateu.ui.mdd.shared.ActionType;
import io.mateu.ui.mdd.shared.MDDLink;
import lombok.Getter;
import lombok.Setter;
import org.jdom2.Element;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * holder for customers (e.g. a touroperator, a travel agency, ...)
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter
@Setter
public class Actor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    @SearchFilter
    @ListColumn
    private String name;

    @ListColumn
    private String businessName;

    private String address;

    private String vatIdentificationNumber;

    @ListColumn
    private String email;

    @ListColumn
    private String comments;

    @ManyToOne
    @NotNull
    private Currency currency;


    @SameLine
    @Separator("Xxxxx")
    private String sendOrdersTo;
    private boolean automaticOrderSending;
    private boolean automaticOrderConfirmation;

    @SameLine
    private boolean exportableToinvoicingApp;
    private String idInInvoicingApp;
    private boolean shuttleTransfersInOwnInvoice;

    @SameLine
    @Output
    @OneToMany(mappedBy = "actor")
    private List<Invoice> invoices = new ArrayList<>();


    @Override
    public String toString() {
        return getName();
    }

    public Element toXml() {
        Element xml = new Element("actor");
        xml.setAttribute("id", "" + getId());
        xml.setAttribute("name", getName());
        if (getBusinessName() != null) xml.setAttribute("bussinessName", getBusinessName());
        if (getAddress() != null) xml.setAttribute("address", getBusinessName());
        if (getVatIdentificationNumber() != null) xml.setAttribute("vaiIdentificationNumber", getVatIdentificationNumber());
        if (getEmail() != null) xml.setAttribute("email", getEmail());
        if (getComments() != null) xml.setAttribute("comments", getComments());

        return xml;
    }



    @Links
    public List<MDDLink> getLinks() {
        List<MDDLink> l = new ArrayList<>();
        l.add(new MDDLink("Invoices", Invoice.class, ActionType.OPENLIST, new Data("actor.id", getId())));
        return l;
    }

}
