package com.example.demo.ddd.infra.in.ui.financial.pages;

import com.example.demo.ddd.infra.out.persistence.hotel.financial.Invoice;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.InvoiceRepository;
import io.mateu.core.infra.declarative.GenericCrud;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Invoices extends GenericCrud<Invoice> {

    final InvoiceRepository invoiceRepository;

    @Override
    public Repository<Invoice, String> repository() {
        return invoiceRepository;
    }

}
