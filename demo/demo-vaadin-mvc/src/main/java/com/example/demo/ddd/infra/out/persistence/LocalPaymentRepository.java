package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.financial.Invoice;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.InvoiceRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.Payment;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalPaymentRepository extends LocalRepository<Payment, String> implements PaymentRepository {
}
