package com.dinidu.pms.controller;

import com.dinidu.pms.entity.User;
import com.dinidu.pms.repo.UserRepository;
import com.dinidu.pms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Controller
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
public class OAuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final Logger logger = LoggerFactory.getLogger(OAuthController.class);

    @Value("${oauth.google.client-id:}")
    private String googleClientId;

    @Value("${oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${oauth.github.client-id:}")
    private String githubClientId;

    @Value("${oauth.github.client-secret:}")
    private String githubClientSecret;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.server.url:http://localhost:8080}")
    private String serverUrl;

    private final RestTemplate rest = new RestTemplate();

    @GetMapping("/{provider}/authorize")
    public ResponseEntity<?> authorizeUrl(@PathVariable String provider) {
        if ("google".equalsIgnoreCase(provider)) {
            if (googleClientId == null || googleClientId.isBlank()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Google OAuth not configured");
            }
        String redirect = URI.create(serverUrl).resolve("/api/auth/oauth2/google/callback").toString();
        String encoded = URLEncoder.encode(redirect, StandardCharsets.UTF_8);
        String url = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=" + googleClientId
            + "&scope=openid%20email%20profile&redirect_uri=" + encoded + "&access_type=online&prompt=select_account";
            return ResponseEntity.ok(Map.of("url", url));
        }

        if ("github".equalsIgnoreCase(provider)) {
            if (githubClientId == null || githubClientId.isBlank()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("GitHub OAuth not configured");
            }
            String redirect = URI.create(serverUrl).resolve("/api/auth/oauth2/github/callback").toString();
            String encoded = URLEncoder.encode(redirect, StandardCharsets.UTF_8);
            String url = "https://github.com/login/oauth/authorize?client_id=" + githubClientId + "&scope=user:email&redirect_uri=" + encoded;
            return ResponseEntity.ok(Map.of("url", url));
        }

        return ResponseEntity.badRequest().body("Unknown provider");
    }

    // Redirect endpoint that instructs the browser to go to the provider authorize URL
    @GetMapping("/redirect/{provider}")
    public ResponseEntity<Void> redirectToProvider(@PathVariable String provider) {
        if ("google".equalsIgnoreCase(provider)) {
            String redirect = URI.create(serverUrl).resolve("/api/auth/oauth2/google/callback").toString();
            String encoded = URLEncoder.encode(redirect, StandardCharsets.UTF_8);
            String url = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=" + googleClientId
                    + "&scope=openid%20email%20profile&redirect_uri=" + encoded + "&access_type=online&prompt=select_account";
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
        }

        if ("github".equalsIgnoreCase(provider)) {
            String redirect = URI.create(serverUrl).resolve("/api/auth/oauth2/github/callback").toString();
            String encoded = URLEncoder.encode(redirect, StandardCharsets.UTF_8);
            String url = "https://github.com/login/oauth/authorize?client_id=" + githubClientId + "&scope=user:email&redirect_uri=" + encoded;
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
        }

        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestParam(name = "code", required = false) String code) {
        try {
            if (code == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing code");
            }

            String tokenUrl = "https://oauth2.googleapis.com/token";
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("redirect_uri", serverUrl + "/api/auth/oauth2/google/callback");
            params.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<Map> tokenResp = rest.postForEntity(tokenUrl, request, Map.class);
            Map body = tokenResp.getBody();
            String accessToken = (String) body.get("access_token");

            // fetch user info
            HttpHeaders auth = new HttpHeaders();
            auth.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(auth);
            ResponseEntity<Map> userResp = rest.exchange("https://openidconnect.googleapis.com/v1/userinfo", HttpMethod.GET, entity, Map.class);
            Map userInfo = userResp.getBody();
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                String base = email.split("@")[0];
                String candidate = base;
                int suffix = 0;
                while (userRepository.existsByUsername(candidate)) {
                    suffix++;
                    candidate = base + suffix;
                }
                User u = User.builder()
                        .email(email)
                        .username(candidate)
                        .firstName(name)
                        .role(User.Role.USER)
                        .password("oauth")
                        .build();
                return userRepository.save(u);
            });

            String jwt = jwtService.generateToken(user);
            String redirect = frontendUrl + "/oauth-callback.html?token=" + jwt;
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirect)).build();

        } catch (Exception e) {
            logger.error("Google OAuth failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("OAuth failed");
        }
    }

    @GetMapping("/github/callback")
    public ResponseEntity<?> githubCallback(@RequestParam(name = "code", required = false) String code) {
        try {
            if (code == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing code");
            }

            // exchange code for access token
            String tokenUrl = "https://github.com/login/oauth/access_token";
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", githubClientId);
            params.add("client_secret", githubClientSecret);
            params.add("redirect_uri", serverUrl + "/api/auth/oauth2/github/callback");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<Map> tokenResp = rest.postForEntity(tokenUrl, request, Map.class);
            Map tokenBody = tokenResp.getBody();
            String accessToken = (String) tokenBody.get("access_token");

            // get user
            HttpHeaders auth = new HttpHeaders();
            auth.setBearerAuth(accessToken);
            auth.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(auth);
            ResponseEntity<Map> userResp = rest.exchange("https://api.github.com/user", HttpMethod.GET, entity, Map.class);
            Map userInfo = userResp.getBody();
            String username = (String) userInfo.get("login");

            // GitHub may not return public email; fetch emails
            ResponseEntity<java.util.List> emailsResp = rest.exchange("https://api.github.com/user/emails", HttpMethod.GET, entity, java.util.List.class);
            String email = null;
            for (Object o : emailsResp.getBody()) {
                Map em = (Map) o;
                Boolean primary = (Boolean) em.get("primary");
                if (primary != null && primary) {
                    email = (String) em.get("email");
                    break;
                }
            }
            if (email == null && emailsResp.getBody().size() > 0) {
                Map em = (Map) emailsResp.getBody().get(0);
                email = (String) em.get("email");
            }

            if (email == null) {
                email = username + "@users.noreply.github.com";
            }

            String finalEmail = email;
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                String base = username != null ? username : (finalEmail.split("@")[0]);
                String candidate = base;
                int suffix = 0;
                while (userRepository.existsByUsername(candidate)) {
                    suffix++;
                    candidate = base + suffix;
                }
                User u = User.builder()
                        .email(finalEmail)
                        .username(candidate)
                        .firstName((String) userInfo.get("name"))
                        .role(User.Role.USER)
                        .password("oauth")
                        .build();
                return userRepository.save(u);
            });

            String jwt = jwtService.generateToken(user);
            String redirect = frontendUrl + "/oauth-callback.html?token=" + jwt;
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirect)).build();

        } catch (Exception e) {
            logger.error("GitHub OAuth failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("OAuth failed");
        }
    }
}
