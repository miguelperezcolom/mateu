package com.example.demo.infra.in.ui.fluent.usecases.rra;

import io.mateu.uidl.data.Amount;

public record OrderDetailLine(
        String lineId,
        String productId,
        String productName,
        String image,
        Amount listPrice,
        int quantity,
        Amount amount
) {

}
