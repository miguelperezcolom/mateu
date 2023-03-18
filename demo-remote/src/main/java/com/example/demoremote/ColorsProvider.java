package com.example.demoremote;

import com.example.demoremote.entities.TeamRepository;
import io.mateu.mdd.shared.data.ItemsListProvider;
import io.mateu.mdd.shared.data.Value;
import io.mateu.mdd.shared.data.ValuesListProvider;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ColorsProvider implements ValuesListProvider {

    @Override
    public List<Object> getAll() {
        return List.of("Red", "Blue", "Yellow", "Orange", "Green", "White", "Black");
    }
}
