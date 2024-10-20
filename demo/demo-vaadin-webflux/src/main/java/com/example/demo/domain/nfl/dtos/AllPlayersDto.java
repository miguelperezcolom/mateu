package com.example.demo.domain.nfl.dtos;

import lombok.Data;

@Data
public class AllPlayersDto {

  private int count;

  private int pageIndex;

  private int pageCount;

  private AllPlayersItemDto[] items;
}
