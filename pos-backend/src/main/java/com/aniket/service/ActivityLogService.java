package com.aniket.service;

public interface ActivityLogService {

    void log(String action, String description, String entityType, Long entityId, String performedBy, String status);
}