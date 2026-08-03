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
	User findByPhone(String phone);

	@Query("SELECT u FROM User u WHERE u.fullName = :q OR u.email = :q")
	User findByFullNameOrEmail(@Param("q") String q);
	Set<User> findByRole(UserRole role);
	List<User> findByBranchId(Long branchId);
	List<User>findByStoreId(Long storeId);
	List<User> findByStoreAndRoleIn(com.aniket.modal.Store store, List<UserRole> roles);
	List<User> findByBranchAndRoleIn(com.aniket.modal.Branch branch, List<UserRole> roles);

	// Fetch ALL employees for a store — both store-level (u.store) and branch-level (u.branch.store)
	// Use explicit LEFT JOIN so store-level staff (branch_id IS NULL) are not dropped by an implicit INNER JOIN
	@Query("SELECT u FROM User u LEFT JOIN u.branch b WHERE u.store.id = :storeId OR b.store.id = :storeId")
	List<User> findAllEmployeesByStoreId(@Param("storeId") Long storeId);

//	analysis
@Query("""
        SELECT COUNT(u)
        FROM User u LEFT JOIN u.branch b
        WHERE (u.store.storeAdmin.id = :storeAdminId OR b.store.storeAdmin.id = :storeAdminId)
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
    WHERE (u.lastLogin IS NULL OR u.lastLogin < :cutoffDate)
    AND u.branch.store.storeAdmin.id = :storeAdminId
    AND u.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
""")
	List<UserDTO> findInactiveCashiers(@Param("storeAdminId") Long storeAdminId,
									   @Param("cutoffDate") LocalDateTime cutoffDate);

    // Sales Management: count active cashiers (logged in today, Asia/Kolkata boundaries)
    @Query("""
        SELECT COUNT(u)
        FROM User u
        WHERE u.lastLogin >= :startOfToday
        AND u.branch.store.storeAdmin.id = :storeAdminId
        AND u.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
    """)
    int countActiveCashiersByStoreAdmin(@Param("storeAdminId") Long storeAdminId,
                                        @Param("startOfToday") LocalDateTime startOfToday);

    @Query("""
        SELECT COUNT(u)
        FROM User u
        WHERE u.lastLogin BETWEEN :start AND :end
        AND u.branch.store.storeAdmin.id = :storeAdminId
        AND u.role = com.aniket.domain.UserRole.ROLE_BRANCH_CASHIER
    """)
    int countActiveCashiersBetweenByStoreAdmin(@Param("storeAdminId") Long storeAdminId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);




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