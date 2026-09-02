package com.aniket.repository;

import com.aniket.modal.Branch;
import com.aniket.modal.BranchSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BranchSettingRepository extends JpaRepository<BranchSetting, Long> {

    Optional<BranchSetting> findByBranchId(Long branchId);

    Optional<BranchSetting> findByBranch(Branch branch);
}
