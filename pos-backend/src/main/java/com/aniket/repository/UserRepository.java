package com.aniket.repository;

import com.aniket.domain.UserRole;
import com.aniket.modal.User;

import com.aniket.payload.dto.UserDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;


public interface UserRepository extends JpaRepository<User, Long> {
	
	User findByEmail(String email);
	Set<User> findByRole(UserRole role);
	List<User> findByBranchId(Long branchId);
	List<User>findByStoreId(Long storeId);
	List<User> findByStoreAndRoleIn(com.aniket.modal.Store store, List<UserRole> roles);
	List<User> findByBranchAndRoleIn(com.aniket.modal.Branch branch, List<UserRole> roles);

//	analysis
@Query("""
        SELECT COUNT(u)
        FROM User u
        WHERE u.id IN (
            SELECT s.storeAdmin.id FROM Store s WHERE s.storeAdmin.id = :storeAdminId
        )
        AND u.role IN (:roles)
    """)
int countByStoreAdminIdAndRoles(@Param("storeAdminId") Long storeAdminId,
								@Param("roles") List<UserRole> roles);

	@Query("""
    SELECT new com.aniket.payload.dto.UserDTO(
		u.id,
		u.email,
		u.fullName, u.role, u.branch.name, u.lastLogin
    )
    FROM User u
    WHERE u.lastLogin < :cutoffDate
    AND u.branch.store.storeAdmin.id = :storeAdminId
    AND u.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
""")
	List<UserDTO> findInactiveCashiers(@Param("storeAdminId") Long storeAdminId,
									   @Param("cutoffDate") LocalDateTime cutoffDate);



// WHERE u.lastLogin < :cutoffDate
//	@Query("""
//        SELECT u.fullName
//        FROM User u
//        Where u.branch.store.storeAdmin.id=:storeAdminId
//        AND u.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
//    """)
//	List<String> findInactiveCashiers(@Param("storeAdminId") Long storeAdminId,
//									  @Param("cutoffDate") LocalDateTime cutoffDate
//									  );


//	@Query("""
//    SELECT u FROM User u
//    WHERE u.store.id = :storeAdminId
//    AND u.role = 'ROLE_BRANCH_CASHIER'
//    AND (u.updatedAt IS NULL OR u.updatedAt < :cutoffDate)
//    """)
//	List<User> findInactiveCashiers(@Param("storeAdminId") Long storeAdminId,
//									@Param("cutoffDate") LocalDateTime cutoffDate);

}
