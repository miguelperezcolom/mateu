package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.PaxType;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SaleScope;

public record TariffGeneralInfo(
        TariffStatus status,
        String hotelId,
        String currencyIsoCode,
        String seasonId,
        boolean channelManager,
        String nameInChannelManager,
        TariffType type,
        boolean discountRPCPrices,
        double averagePrice,
        boolean taxIncluded,
        String baseRoomId,
        OccupationType occupationType,
        PaxType basePaxType,
        int position,
        String baseBoardType,
        boolean active,
        int version,
        boolean linkedToDispo,
        String refCode,
        boolean offersApply,
        boolean extrasApply,
        int defaultChildAgeFrom,
        int defaultChildAgeTo,
        SaleScope onlineSaleScope

) {
}
