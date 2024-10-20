package com.example.demo.domain.cms.site;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Profile("local")
@Service
@RequiredArgsConstructor
public class CmsPopulatorStarter {

  final CmsPopulator cmsPopulator;

  @PostConstruct
  public void populate() {
    cmsPopulator.populate();
  }
}
