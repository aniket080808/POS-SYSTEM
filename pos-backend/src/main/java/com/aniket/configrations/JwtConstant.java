package com.aniket.configrations;

public class JwtConstant {
 
	public static final String SECRET_KEY = System.getenv("JWT_SECRET") != null ? 
		System.getenv("JWT_SECRET") : "asdfghjklpoiuytrewqzxcvbnmlkjhglpouhggfdsawqwertyyuiioplmnbvcxzasdfgh";
	public static final String JWT_HEADER = "Authorization";
}