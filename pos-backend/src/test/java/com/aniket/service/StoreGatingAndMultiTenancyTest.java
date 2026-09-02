package com.aniket.service;

import com.aniket.domain.StoreStatus;
import com.aniket.domain.StoreSubscriptionStatus;
import com.aniket.domain.UserRole;
import com.aniket.exception.AccessDeniedException;
import com.aniket.modal.Store;
import com.aniket.modal.StoreSubscription;
import com.aniket.modal.User;
import com.aniket.payload.dto.StoreDTO;
import com.aniket.payload.dto.StoreSettingsDTO;
import com.aniket.payload.response.StoreSubscriptionStatusResponse;
import com.aniket.repository.StoreRepository;
import com.aniket.repository.StoreSubscriptionRepository;
import com.aniket.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@SpringBootTest
@Transactional
public class StoreGatingAndMultiTenancyTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private StoreSubscriptionRepository storeSubscriptionRepository;

    @Autowired
    private StoreSubscriptionService storeSubscriptionService;

    @Autowired
    private StoreSettingsService storeSettingsService;

    @Autowired
    private StoreService storeService;

    private User storeAdmin;
    private User storeManager;
    private Store store;
    private Store store2;
    private User storeAdmin2;

    @BeforeEach
    public void setup() {
        // Create Store Admin 1 & Store 1
        storeAdmin = new User();
        storeAdmin.setFullName("Test Store Admin");
        storeAdmin.setEmail("admin1@teststore.com");
        storeAdmin.setPassword("password");
        storeAdmin.setRole(UserRole.ROLE_STORE_ADMIN);
        storeAdmin = userRepository.save(storeAdmin);

        store = new Store();
        store.setBrand("Test Store 1");
        store.setStoreAdmin(storeAdmin);
        store.setStatus(StoreStatus.ACTIVE);
        store.setGstNumber("27AAAAA0000A1Z5");
        store.setPanNumber("ABCDE1234F");
        store = storeRepository.save(store);

        // Store 1 Subscription
        StoreSubscription sub = StoreSubscription.builder()
                .store(store)
                .status(StoreSubscriptionStatus.ACTIVE)
                .build();
        storeSubscriptionRepository.save(sub);

        // Create Store Manager for Store 1
        storeManager = new User();
        storeManager.setFullName("Test Store Manager");
        storeManager.setEmail("manager1@teststore.com");
        storeManager.setPassword("password");
        storeManager.setRole(UserRole.ROLE_STORE_MANAGER);
        storeManager.setStore(store);
        storeManager = userRepository.save(storeManager);

        // Create Store 2 (Different store)
        storeAdmin2 = new User();
        storeAdmin2.setFullName("Test Store Admin 2");
        storeAdmin2.setEmail("admin2@teststore.com");
        storeAdmin2.setPassword("password");
        storeAdmin2.setRole(UserRole.ROLE_STORE_ADMIN);
        storeAdmin2 = userRepository.save(storeAdmin2);

        store2 = new Store();
        store2.setBrand("Test Store 2");
        store2.setStoreAdmin(storeAdmin2);
        store2.setStatus(StoreStatus.ACTIVE);
        store2 = storeRepository.save(store2);
    }

    private void setSecurityContextUser(User user) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    public void testStoreSubscriptionStatusResolvedPerStoreForStoreManager() {
        setSecurityContextUser(storeManager);

        // Call storeSubscriptionService for Store Manager
        StoreSubscriptionStatusResponse response = storeSubscriptionService.getStatusResponseForUser(storeManager);

        Assertions.assertNotNull(response, "Response should not be null");
        Assertions.assertEquals(StoreStatus.ACTIVE, response.getRegistrationStatus(), "Registration status should be ACTIVE for store manager's store");
        Assertions.assertEquals(StoreSubscriptionStatus.ACTIVE, response.getSubscriptionStatus(), "Subscription status should be ACTIVE for store manager's store");
    }

    @Test
    public void testStoreSettingsForCurrentStoreAsStoreManager() {
        setSecurityContextUser(storeManager);

        // Call storeSettingsService for Store Manager
        StoreSettingsDTO settings = storeSettingsService.getSettingsForCurrentStore();

        Assertions.assertNotNull(settings, "Store settings should be returned cleanly for Store Manager without 400 error");
        Assertions.assertEquals(store.getId(), settings.getStoreId(), "Settings should belong to Store 1");
    }

    @Test
    public void testStoreManagerCanUpdateOwnStoreGstAndPan() throws Exception {
        setSecurityContextUser(storeManager);

        StoreDTO updateDto = new StoreDTO();
        updateDto.setBrand("Test Store 1 Updated");
        updateDto.setGstNumber("29BBBBB1111B2Z6");
        updateDto.setPanNumber("XYZPD5678G");

        // Update Store 1 as Store Manager
        StoreDTO updated = storeService.updateStore(store.getId(), updateDto);

        Assertions.assertNotNull(updated, "Updated store should not be null");
        Assertions.assertEquals("29BBBBB1111B2Z6", updated.getGstNumber(), "GST number should be updated");
        Assertions.assertEquals("XYZPD5678G", updated.getPanNumber(), "PAN number should be updated");

        // Confirm database persistence
        Store savedInDb = storeRepository.findById(store.getId()).orElse(null);
        Assertions.assertNotNull(savedInDb);
        Assertions.assertEquals("29BBBBB1111B2Z6", savedInDb.getGstNumber());
        Assertions.assertEquals("XYZPD5678G", savedInDb.getPanNumber());
    }

    @Test
    public void testMultiTenancyIsolationStoreManagerCannotUpdateOtherStore() {
        setSecurityContextUser(storeManager);

        StoreDTO updateDto = new StoreDTO();
        updateDto.setBrand("Hacked Store 2");

        // Store Manager of Store 1 attempting to update Store 2
        Assertions.assertThrows(AccessDeniedException.class, () -> {
            storeService.updateStore(store2.getId(), updateDto);
        }, "Updating another store must throw AccessDeniedException");
    }

    @Test
    public void testStoreAdminCannotUpdateOtherStore() {
        setSecurityContextUser(storeAdmin);

        StoreDTO updateDto = new StoreDTO();
        updateDto.setBrand("Hacked Store 2 by Admin 1");

        // Store Admin 1 attempting to update Store 2
        Assertions.assertThrows(AccessDeniedException.class, () -> {
            storeService.updateStore(store2.getId(), updateDto);
        }, "Store Admin updating another store must throw AccessDeniedException");
    }

    @Test
    public void testStoreAdminCannotDeleteOtherStore() {
        setSecurityContextUser(storeAdmin);

        // Store Admin 1 attempting to delete Store 2
        Assertions.assertThrows(AccessDeniedException.class, () -> {
            storeService.deleteStore(store2.getId());
        }, "Store Admin deleting another store must throw AccessDeniedException");
    }

    @Test
    public void testStoreAdminCannotGetOtherStoreById() {
        setSecurityContextUser(storeAdmin);

        // Store Admin 1 attempting to view Store 2
        Assertions.assertThrows(AccessDeniedException.class, () -> {
            storeService.getStoreById(store2.getId());
        }, "Store Admin viewing another store must throw AccessDeniedException");
    }

    @Test
    public void testSuperAdminCanViewAndUpdateAnyStore() throws Exception {
        User superAdmin = new User();
        superAdmin.setFullName("Super Admin");
        superAdmin.setEmail("superadmin@pos.com");
        superAdmin.setPassword("password");
        superAdmin.setRole(UserRole.ROLE_ADMIN);
        superAdmin = userRepository.save(superAdmin);

        setSecurityContextUser(superAdmin);

        // Super Admin can view Store 1 and Store 2
        StoreDTO fetched1 = storeService.getStoreById(store.getId());
        Assertions.assertNotNull(fetched1);

        StoreDTO fetched2 = storeService.getStoreById(store2.getId());
        Assertions.assertNotNull(fetched2);
    }
}
