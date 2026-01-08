package com.example.demo.ddd.infra.in.populator;

import com.example.demo.ddd.infra.in.populator.dtos.AgenciaDto;
import com.example.demo.ddd.infra.in.populator.dtos.DestinoDto;
import com.example.demo.ddd.infra.in.populator.dtos.HotelDto;
import com.example.demo.ddd.infra.in.populator.dtos.RegimenDto;
import com.example.demo.ddd.infra.in.populator.dtos.TipoHabitacionDto;
import com.opencsv.CSVReader;
import lombok.SneakyThrows;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class Reader {

    static List<AgenciaDto> leerAgencias() {
        return readAllLines(Path.of(Reader.class.getResource("/data/agencias.csv").getPath()))
                .stream()
                .map(linea -> new AgenciaDto(linea[0], linea[1]))
                .toList();    }

    static List<HotelDto> leerHoteles() {
        return readAllLines(Path.of(Reader.class.getResource("/data/hoteles.csv").getPath()))
                .stream()
                .map(linea -> new HotelDto(linea[0], linea[1], linea[2], linea[3], linea[4]))
                .toList();
    }

    static List<DestinoDto> leerDestinos() {
        return readAllLines(Path.of(Reader.class.getResource("/data/destinos.csv").getPath()))
                .stream()
                .map(linea -> new DestinoDto(linea[0], linea[1], linea[2], linea[3]))
                .toList();
    }

    static List<RegimenDto> leerRegimenes() {
        return readAllLines(Path.of(Reader.class.getResource("/data/regimenes.csv").getPath()))
                .stream()
                .map(linea -> new RegimenDto(linea[0], linea[1], linea[2]))
                .toList();
    }

    static List<TipoHabitacionDto> leerTiposHabitacion() {
        return readAllLines(Path.of(Reader.class.getResource("/data/tipos_habitacion.csv").getPath()))
                .stream()
                .map(linea -> new TipoHabitacionDto(linea[0], linea[1]))
                .toList();
    }

    @SneakyThrows
    static List<String[]> readAllLines(Path filePath) {
        try (java.io.Reader reader = Files.newBufferedReader(filePath)) {
            try (CSVReader csvReader = new CSVReader(reader)) {
                return csvReader.readAll();
            }
        }
    }

}
