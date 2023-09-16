package com.example.demoremote.domains.cities;

import lombok.Data;

@Data
public class CityDto {

  private String geoname_id;
  private String name;
  private String cou_name_en;
  private int population;
  private String timezone;
  private String modification_date;
}
