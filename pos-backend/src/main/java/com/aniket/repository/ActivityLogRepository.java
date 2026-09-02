package com.aniket.repository;

import com.aniket.modal.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop20ByOrderByCreatedAtDesc();

    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "(:action IS NULL OR :action = '' OR LOWER(a.action) = LOWER(:action)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.performedBy) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.createdAt DESC")
    Page<ActivityLog> searchActivityLogs(@Param("action") String action, @Param("search") String search, Pageable pageable);

    @Query("SELECT DISTINCT a.action FROM ActivityLog a ORDER BY a.action ASC")
    List<String> findDistinctActions();

    @Modifying
    @Query("DELETE FROM ActivityLog a WHERE a.createdAt < :cutoffDate")
    int deleteOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
}
