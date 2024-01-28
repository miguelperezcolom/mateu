package com.example.demoremote.domains.cms.site;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SiteRepository extends JpaRepository<Site, String> {

  Optional<Site> findByHostAndNameAndIsPublic(String host, String name, boolean isPublic);
}
