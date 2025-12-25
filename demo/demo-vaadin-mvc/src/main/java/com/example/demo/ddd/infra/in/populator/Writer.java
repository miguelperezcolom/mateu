package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.domain.hotel.agency.Agency;
import com.example.demo.ddd.domain.hotel.agency.AgencyRepository;
import com.example.demo.ddd.domain.hotel.hotel.Hotel;
import com.example.demo.ddd.domain.hotel.hotel.HotelRepository;
import com.example.demo.ddd.domain.hotel.world.Country;
import com.example.demo.ddd.domain.hotel.world.CountryRepository;
import com.example.demo.ddd.domain.hotel.world.Destination;
import com.example.demo.ddd.domain.hotel.world.DestinationRepository;
import com.example.demo.ddd.infra.in.populator.dtos.HotelDto;

import java.util.List;
import java.util.Map;

public class Writer {

    static void write(
            DataSet dataSet,
            AgencyRepository agencyRepository,
            HotelRepository hotelRepository,
            CountryRepository countryRepository,
            DestinationRepository destinationRepository
            ) {
        writeAgencies(dataSet, agencyRepository);
        writeHotels(dataSet, hotelRepository);
        writeCountries(dataSet, countryRepository);
        writeDestinations(dataSet, destinationRepository);
    }

    private static void writeDestinations(DataSet dataSet, DestinationRepository destinationRepository) {
        destinationRepository.saveAll(dataSet.destinos().stream()
                .map(destino -> new Destination(
                        destino.codigo(),
                        destino.nombre(),
                        dataSet.hoteles().stream()
                                .filter(hotel -> destino.codigo().equals(hotel.idDestino()))
                                .map(HotelDto::codigo).toList()
        )).toList());
    }

    private static void writeCountries(DataSet dataSet, CountryRepository countryRepository) {
        countryRepository.saveAll(dataSet.destinos().stream()
                        .map(destino -> Map.of(
                                "codigo", destino.codigoPais(),
                                "nombre", destino.nombrePais()
                        ))
                        .distinct()
                .map(mapa -> new Country(
                        mapa.get("codigo"),
                        mapa.get("nombre"),
                        List.of()
                )).toList());
    }

    private static void writeHotels(DataSet dataSet, HotelRepository hotelRepository) {
        hotelRepository.saveAll(dataSet.hoteles().stream()
                .map(hotel -> new Hotel(
                        hotel.codigo(),
                        hotel.nombre(),
                        "image",
                        "id_destino",
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                )).toList());
    }

    private static void writeAgencies(DataSet dataSet, AgencyRepository agencyRepository) {
        agencyRepository.saveAll(dataSet.agencias().stream()
                .map(agencia -> new Agency(
                        agencia.codigo(),
                        agencia.nombre()
                )).toList());

    }
}
