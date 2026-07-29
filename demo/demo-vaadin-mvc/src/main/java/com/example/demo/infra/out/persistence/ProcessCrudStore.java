package com.example.demo.infra.out.persistence;

import com.example.demo.infra.in.ui.pages.processes.Process;
import org.springframework.stereotype.Service;

@Service
public class ProcessCrudStore extends AbstractAutoRepository<Process> {
}
