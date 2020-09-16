package com.google.rolecall.util;

import com.google.rolecall.models.User;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CustomUserDetail implements UserDetails {

  private User user;

  private List<? extends GrantedAuthority> authorities;

  private CustomUserDetail(User user) {
    this.user = user;
    this.authorities = Arrays.asList(user.getPermissions()).stream().map(role ->
        new SimpleGrantedAuthority(role)).collect(Collectors.toList());
  }

  public static CustomUserDetail build(User user) {
    return new CustomUserDetail(user);
  }

  public User getUser() {
    return user;
  }

  @Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

  @Override
	public String getPassword() {
		return null;
	}

	@Override
	public String getUsername() {
		return user.getEmail();
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return user.isActive();
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		CustomUserDetail user = (CustomUserDetail) o;
		return this.user.getId() == user.getUser().getId();
	}
}
