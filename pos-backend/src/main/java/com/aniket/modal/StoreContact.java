package com.aniket.modal;



import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Email;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreContact {

    private String address;

    @Column(unique = true)
    private String phone;

    @Column(unique = true)
    @Email(message = "Invalid email format")
    private String email;
}
