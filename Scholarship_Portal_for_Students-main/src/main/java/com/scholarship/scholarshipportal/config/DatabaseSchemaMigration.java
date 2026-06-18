package com.scholarship.scholarshipportal.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseSchemaMigration {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSchemaMigration.class);

    @Bean
    public ApplicationRunner migrateStudentSchema(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                DatabaseMetaData metaData = connection.getMetaData();

                if (!tableExists(metaData, "students")) {
                    return;
                }

                ensureColumn(connection, metaData, "students", "contact_email",
                        "ALTER TABLE students ADD COLUMN contact_email VARCHAR(255) NULL");
                ensureColumn(connection, metaData, "students", "college_name",
                        "ALTER TABLE students ADD COLUMN college_name VARCHAR(255) NULL");
                ensureColumn(connection, metaData, "students", "college_manager_id",
                        "ALTER TABLE students ADD COLUMN college_manager_id BIGINT NULL");
                ensureColumn(connection, metaData, "students", "phone_number",
                    "ALTER TABLE students ADD COLUMN phone_number VARCHAR(30) NULL");
                ensureColumn(connection, metaData, "students", "date_of_birth",
                    "ALTER TABLE students ADD COLUMN date_of_birth DATE NULL");
                ensureColumn(connection, metaData, "students", "gender",
                    "ALTER TABLE students ADD COLUMN gender VARCHAR(20) NULL");
                ensureColumn(connection, metaData, "students", "address",
                    "ALTER TABLE students ADD COLUMN address VARCHAR(500) NULL");
                ensureColumn(connection, metaData, "students", "state",
                    "ALTER TABLE students ADD COLUMN state VARCHAR(120) NULL");
                ensureColumn(connection, metaData, "students", "district",
                    "ALTER TABLE students ADD COLUMN district VARCHAR(120) NULL");
                ensureColumn(connection, metaData, "students", "pincode",
                    "ALTER TABLE students ADD COLUMN pincode VARCHAR(20) NULL");
                ensureColumn(connection, metaData, "students", "institution_name",
                    "ALTER TABLE students ADD COLUMN institution_name VARCHAR(255) NULL");
                ensureColumn(connection, metaData, "students", "department",
                    "ALTER TABLE students ADD COLUMN department VARCHAR(255) NULL");
                ensureColumn(connection, metaData, "students", "course",
                    "ALTER TABLE students ADD COLUMN course VARCHAR(255) NULL");
                ensureColumn(connection, metaData, "students", "year_of_study",
                    "ALTER TABLE students ADD COLUMN year_of_study INT NULL");

                if (tableExists(metaData, "notifications")) {
                    ensureColumn(connection, metaData, "notifications", "student_id",
                        "ALTER TABLE notifications ADD COLUMN student_id BIGINT NULL");
                    ensureColumn(connection, metaData, "notifications", "student_name",
                        "ALTER TABLE notifications ADD COLUMN student_name VARCHAR(255) NULL");
                    ensureColumn(connection, metaData, "notifications", "student_email",
                        "ALTER TABLE notifications ADD COLUMN student_email VARCHAR(255) NULL");
                }

                makeUserIdNullable(connection, metaData);
                ensureCollegeManagerForeignKey(connection, metaData);
            } catch (Exception ex) {
                logger.error("Database schema migration failed: {}", ex.getMessage(), ex);
            }
        };
    }

    private boolean tableExists(DatabaseMetaData metaData, String tableName) throws Exception {
        try (ResultSet resultSet = metaData.getTables(null, null, tableName, null)) {
            if (resultSet.next()) {
                return true;
            }
        }

        try (ResultSet resultSet = metaData.getTables(null, null, tableName.toUpperCase(), null)) {
            return resultSet.next();
        }
    }

    private boolean columnExists(DatabaseMetaData metaData, String tableName, String columnName) throws Exception {
        try (ResultSet resultSet = metaData.getColumns(null, null, tableName, columnName)) {
            if (resultSet.next()) {
                return true;
            }
        }

        try (ResultSet resultSet = metaData.getColumns(null, null, tableName.toUpperCase(), columnName.toUpperCase())) {
            return resultSet.next();
        }
    }

    private void ensureColumn(Connection connection,
                              DatabaseMetaData metaData,
                              String tableName,
                              String columnName,
                              String sql) throws Exception {
        if (columnExists(metaData, tableName, columnName)) {
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
            logger.info("Applied schema update: {}.{}", tableName, columnName);
        }
    }

    private void makeUserIdNullable(Connection connection, DatabaseMetaData metaData) throws Exception {
        if (!columnExists(metaData, "students", "user_id")) {
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE students MODIFY COLUMN user_id BIGINT NULL");
            logger.info("Applied schema update: students.user_id is now nullable");
        }
    }

    private void ensureCollegeManagerForeignKey(Connection connection, DatabaseMetaData metaData) throws Exception {
        boolean hasForeignKey = false;
        try (ResultSet resultSet = metaData.getImportedKeys(connection.getCatalog(), null, "students")) {
            while (resultSet.next()) {
                String fkColumn = resultSet.getString("FKCOLUMN_NAME");
                if ("college_manager_id".equalsIgnoreCase(fkColumn)) {
                    hasForeignKey = true;
                    break;
                }
            }
        }

        if (hasForeignKey) {
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE students ADD CONSTRAINT fk_students_college_manager FOREIGN KEY (college_manager_id) REFERENCES users(id)");
            logger.info("Applied schema update: students.college_manager_id foreign key created");
        } catch (Exception ex) {
            logger.warn("Skipping college_manager_id foreign key creation: {}", ex.getMessage());
        }
    }
}
