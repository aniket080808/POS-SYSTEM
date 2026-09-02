package com.aniket.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.aniket.domain.UserRole;
import jakarta.persistence.*;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_store_id", columnList = "store_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank(message = "fullName is mandatory")
    private String fullName;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    private String email;

    private String phone;

    @OneToOne(mappedBy = "storeAdmin")
    @JsonIgnore
    private Store ownedStore;

    @ManyToOne
    @JoinColumn(name = "store_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
    @JsonIgnore
    private Store store;

    @ManyToOne
    @JsonIgnore
    private Branch branch;

    @Column(nullable = false)
    @NotNull(message = "Role is mandatory")
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(columnDefinition = "boolean default true")
    private Boolean enabled = true;

    private LocalDateTime passwordChangedAt;

    private LocalDateTime lastLogin;

    private LocalDateTime lastActivity;

    @JsonIgnore
    public Store getStore() {
        if (this.ownedStore != null) {
            return this.ownedStore;
        }
        if (this.store != null) {
            return this.store;
        }
        if (this.branch != null && this.branch.getStore() != null) {
            return this.branch.getStore();
        }
        return null;
    }
}

