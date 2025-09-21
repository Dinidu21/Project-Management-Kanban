package com.dinidu.pms.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Logs method entry/exit and exceptions for all Controllers.
 * Pointcuts target classes in package com.dinidu.pms.controller..*
 * and any bean annotated with @RestController.
 */
@Aspect
@Component
public class LoggingAspect {

    private static final Set<String> SENSITIVE_KEYS = new HashSet<>(Arrays.asList(
            "password", "pwd", "secret", "token", "accessToken", "refreshToken", "authorization"
    ));

    @Around("within(com.dinidu.pms.controller..*) || @within(org.springframework.web.bind.annotation.RestController)")
    public Object logAroundControllers(ProceedingJoinPoint pjp) throws Throwable {
        Signature sig = pjp.getSignature();
        Class<?> type = sig.getDeclaringType();
        Logger logger = LoggerFactory.getLogger(type);

        String method = sig.getName();
        String args = mask(toArgsString(pjp.getArgs()));

        long start = System.currentTimeMillis();
        logger.info("ENTER {}({})", method, args);
        try {
            Object result = pjp.proceed();
            long took = System.currentTimeMillis() - start;
            String ret = mask(safeToString(result));
            logger.info("EXIT  {}() took={}ms result={}", method, took, ret);
            return result;
        } catch (Throwable ex) {
            long took = System.currentTimeMillis() - start;
            logger.error("THROW {}() took={}ms ex={} msg={}", method, took, ex.getClass().getSimpleName(), ex.getMessage(), ex);
            throw ex;
        }
    }

    private static String toArgsString(Object[] args) {
        if (args == null || args.length == 0) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < args.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(safeToString(args[i]));
        }
        return sb.toString();
    }

    private static String safeToString(Object obj) {
        if (obj == null) return "null";
        try {
            return String.valueOf(obj);
        } catch (Exception e) {
            return obj.getClass().getSimpleName();
        }
    }

    /**
     * Naive masking for common sensitive keys within JSON-like strings.
     */
    private static String mask(String text) {
        if (text == null || text.isBlank()) return text;
        String masked = text;

        for (String key : SENSITIVE_KEYS) {
            // "key":"value"
            String q = "(?i)(\\\"" + key + "\\\"\\s*:\\s*\\\")(.*?)(\\\")";
            masked = masked.replaceAll(q, "$1***$3");
            // 'key':'value'
            String s = "(?i)(\\'" + key + "\\'\\s*:\\s*\\')(.*?)(\\')";
            masked = masked.replaceAll(s, "$1***$3");
        }
        // Mask Bearer tokens
        masked = masked.replaceAll("(?i)Bearer\\s+[A-Za-z0-9\\-_.=]+", "Bearer ***");
        return masked;
    }
}