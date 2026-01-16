package com.example.demo.ddd.infra.in.ui.financial.pages;

import com.example.demo.ddd.infra.out.persistence.hotel.financial.Payment;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.PaymentRepository;
import io.mateu.core.infra.declarative.GenericCrud;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Payments extends GenericCrud<Payment> {

    final PaymentRepository paymentRepository;

    @Override
    public Repository<Payment, String> repository() {
        return paymentRepository;
    }

}
