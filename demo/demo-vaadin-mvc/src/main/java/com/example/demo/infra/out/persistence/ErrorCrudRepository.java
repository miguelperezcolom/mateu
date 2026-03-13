package com.example.demo.infra.out.persistence;

import com.example.demo.infra.in.ui.pages.processes.Error;
import com.example.demo.infra.in.ui.pages.processes.Message;
import org.springframework.stereotype.Service;

@Service
public class ErrorCrudRepository extends AbstractAutoRepository<Error> {
}
