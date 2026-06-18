package com.scholarship.scholarshipportal.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis Configuration for the Scholarship Portal.
 *
 * WHY THIS EXISTS:
 * ----------------
 * The default Spring Boot auto-configured RedisTemplate uses JdkSerializationRedisSerializer,
 * which stores data as binary blobs — unreadable in redis-cli and tightly coupled to Java class
 * versions. This configuration switches to JSON serialization, making cache entries human-readable,
 * language-agnostic, and version-tolerant.
 *
 * DESIGN PATTERN: Configuration Pattern (Centralized Bean Factory)
 *
 * REDIS CONCEPTS:
 * - RedisTemplate: The central abstraction for Redis operations (GET, SET, DEL, EXPIRE)
 * - Serializer: Converts Java objects ↔ byte[] for storage. StringRedisSerializer for keys,
 *   GenericJackson2JsonRedisSerializer for values.
 * - LettuceConnectionFactory: Non-blocking, thread-safe Redis client (default in Spring Boot 3).
 *
 * INTERVIEW QUESTIONS:
 * 1. Why not use JdkSerializationRedisSerializer? → Binary format, unreadable, ClassNotFoundException
 *    risks on version changes.
 * 2. Why GenericJackson2JsonRedisSerializer over Jackson2JsonRedisSerializer?
 *    → Generic variant stores @class metadata so deserialization knows the target type automatically.
 * 3. Why Lettuce over Jedis? → Lettuce is non-blocking (Netty-based), thread-safe with a single
 *    connection, supports reactive programming. Jedis uses blocking I/O and requires connection pooling.
 * 4. What happens if Redis is down? → The application should still work; cache misses fall through
 *    to the database. We handle this with try-catch in cache services.
 */
@Configuration
public class RedisConfig {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    /**
     * Creates the Redis connection factory using Lettuce (non-blocking client).
     *
     * HOW IT WORKS:
     * 1. Reads host/port from application.properties (defaults to localhost:6379)
     * 2. Creates a standalone configuration (non-clustered)
     * 3. Wraps it in LettuceConnectionFactory for connection management
     *
     * In production, you would configure:
     * - Connection pooling (LettucePoolingClientConfiguration)
     * - SSL/TLS for encrypted connections
     * - Sentinel or Cluster mode for high availability
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        logger.info("Initializing Redis connection: {}:{}", redisHost, redisPort);

        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);

        if (redisPassword != null && !redisPassword.isEmpty()) {
            config.setPassword(redisPassword);
        }

        return new LettuceConnectionFactory(config);
    }

    /**
     * Configures the RedisTemplate with JSON serialization.
     *
     * HOW IT WORKS:
     * 1. Keys are serialized as plain strings (e.g., "scholarship:42")
     * 2. Values are serialized as JSON with type information embedded
     * 3. Hash keys/values follow the same serialization strategy
     *
     * CACHE HIT EXAMPLE (what Redis stores):
     *   Key:   "scholarship:42"
     *   Value: {"@class":"com.scholarship.scholarshipportal.dto.ScholarshipDTO",
     *           "id":42,"title":"Merit Scholarship","amount":50000,...}
     *
     * The @class field allows GenericJackson2JsonRedisSerializer to deserialize
     * back to the correct Java type without explicit type hints in code.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Configure ObjectMapper for proper JSON serialization
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        // Key serializer: plain strings for human-readable keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Value serializer: JSON for structured, readable values
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();

        logger.info("RedisTemplate configured with JSON serialization");
        return template;
    }
}
