package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.booking.File;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.Invoice;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.InvoiceRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalInvoiceRepository extends LocalRepository<Invoice, String> implements InvoiceRepository {
}
