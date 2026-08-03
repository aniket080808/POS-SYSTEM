package com.aniket.exception;

public class FeatureNotEnabledException extends RuntimeException {
    public FeatureNotEnabledException(String message) {
        super(message);
    }
}