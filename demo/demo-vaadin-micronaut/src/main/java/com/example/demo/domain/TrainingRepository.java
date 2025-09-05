package com.example.demo.domain;

import jakarta.inject.Singleton;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Singleton
public class TrainingRepository {

    List<Training> trainings = new ArrayList<>();

    public List<Training> findAll() {
        return trainings;
    }

    public Optional<Training> findById(String id) {
        return trainings.stream().filter(training -> training.id().equals(id)).findFirst();
    }

    public Training save(Training training) {
        remove(training);
        trainings.add(training);
        return training;
    }

    public void remove(Training training) {
        var found = trainings.stream().filter(item -> item.id().equals(training.id())).findFirst();
        if (found.isPresent()) {
            trainings.remove(found.get());
        }
    }
}
