package com.example.demoremote.nfl.downloader;

import lombok.Data;

@Data
public class AllPlayersDto {

    private int count;

    private int pageIndex;

    private int pageCount;

    private AllPlayersItemDto[] items;

}
