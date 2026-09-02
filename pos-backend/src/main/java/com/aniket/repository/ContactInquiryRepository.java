package com.aniket.repository;

import com.aniket.modal.ContactInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {
    List<ContactInquiry> findByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
