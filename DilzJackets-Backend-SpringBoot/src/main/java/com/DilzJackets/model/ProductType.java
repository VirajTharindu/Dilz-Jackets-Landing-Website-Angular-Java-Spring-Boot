package com.DilzJackets.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ProductType {
    JACKET,
    RAINCOAT,
    RAINCOATS;

    @JsonCreator
    public static ProductType fromString(String value) {
        if (value == null) return JACKET;
        String val = value.trim().toUpperCase();
        if (val.startsWith("RAINCOAT")) {
            return RAINCOAT;
        }
        return JACKET;
    }
}
