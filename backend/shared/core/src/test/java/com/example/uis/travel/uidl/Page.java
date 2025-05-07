package com.example.uis.travel.uidl;

import java.util.List;

public record Page<T>(int totalPages, long totalElements, List<T> content ) {

}
