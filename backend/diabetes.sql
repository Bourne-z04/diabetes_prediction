CREATE DATABASE IF NOT EXISTS diabetes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE diabetes;

-- 用户表结构
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id SMALLINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 健康信息表结构
CREATE TABLE IF NOT EXISTS health_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '关联用户ID',
    age INT NOT NULL COMMENT '年龄（岁）',
    bmi FLOAT NOT NULL COMMENT '体重指数 (kg/m²)',
    insulin FLOAT NOT NULL COMMENT '2小时血清胰岛素 (μU/ml)',
    skin_thickness INT NOT NULL COMMENT '肱三头肌皮褶厚度 (mm)',
    glucose INT NOT NULL COMMENT '口服葡萄糖耐量实验血浆葡萄糖浓度 (mg/dL)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户健康信息表结构
CREATE TABLE IF NOT EXISTS user_health_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    health_info_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (health_info_id) REFERENCES health_info(id) ON DELETE CASCADE,
    INDEX (user_id),
    INDEX (health_info_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 糖尿病数据集表结构
CREATE TABLE IF NOT EXISTS diabetes_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Pregnancies INT NOT NULL COMMENT '怀孕次数',
    Glucose INT NOT NULL COMMENT '口服葡萄糖耐量实验中血浆葡萄糖浓度（2小时）',
    BloodPressure INT NOT NULL COMMENT '舒张压（mmHg)',
    SkinThickness INT NOT NULL COMMENT '肱三头肌皮褶厚度（mm)',
    Insulin INT NOT NULL COMMENT '2 小时血清胰岛素（μU/ml)',
    BMI FLOAT NOT NULL COMMENT '体重指数（体重kg/(身高m)^2)',
    DiabetesPedigreeFunction FLOAT NOT NULL COMMENT '糖尿病谱系功能',
    Age INT NOT NULL COMMENT '年龄（岁）',
    Outcome INT NOT NULL COMMENT '是否患病（0或1)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

