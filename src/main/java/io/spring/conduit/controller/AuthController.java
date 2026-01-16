package io.spring.conduit.controller;

import io.spring.conduit.domain.User;
import io.spring.conduit.security.JwtService;
import io.spring.conduit.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/login")
    public String loginPage(@AuthenticationPrincipal User currentUser, Model model) {
        if (currentUser != null) {
            return "redirect:/";
        }
        model.addAttribute("authType", "login");
        model.addAttribute("title", "Sign in");
        return "auth/login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        HttpServletResponse response,
                        RedirectAttributes redirectAttributes) {
        Optional<User> userOptional = userService.login(email, password);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = jwtService.generateToken(user.getId());
            
            Cookie cookie = new Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(86400); // 24 hours
            response.addCookie(cookie);
            
            return "redirect:/";
        }
        
        Map<String, String> errors = new HashMap<>();
        errors.put("email or password", "is invalid");
        redirectAttributes.addFlashAttribute("errors", errors);
        return "redirect:/login";
    }

    @GetMapping("/register")
    public String registerPage(@AuthenticationPrincipal User currentUser, Model model) {
        if (currentUser != null) {
            return "redirect:/";
        }
        model.addAttribute("authType", "register");
        model.addAttribute("title", "Sign up");
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@RequestParam String username,
                          @RequestParam String email,
                          @RequestParam String password,
                          HttpServletResponse response,
                          RedirectAttributes redirectAttributes) {
        try {
            User user = userService.register(email, username, password);
            String token = jwtService.generateToken(user.getId());
            
            Cookie cookie = new Cookie("jwt", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(86400); // 24 hours
            response.addCookie(cookie);
            
            return "redirect:/";
        } catch (IllegalArgumentException e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("registration", e.getMessage());
            redirectAttributes.addFlashAttribute("errors", errors);
            return "redirect:/register";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        return "redirect:/";
    }
}
