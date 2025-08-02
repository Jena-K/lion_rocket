-- AI Chat Service Database Schema
-- SQLite Database

-- 사용자 테이블
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 캐릭터 테이블
CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    system_prompt TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 공용 프롬프트 테이블
CREATE TABLE common_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 채팅 세션 테이블
CREATE TABLE chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    character_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 메시지 테이블
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- 사용량 통계 테이블
CREATE TABLE usage_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    usage_date DATE NOT NULL,
    chat_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, usage_date)
);

-- 인덱스 생성
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_character_id ON chats(character_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX idx_usage_stats_date ON usage_stats(usage_date);

-- 업데이트 트리거
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_characters_timestamp 
AFTER UPDATE ON characters
BEGIN
    UPDATE characters SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_common_prompts_timestamp 
AFTER UPDATE ON common_prompts
BEGIN
    UPDATE common_prompts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 채팅 마지막 메시지 시간 업데이트 트리거
CREATE TRIGGER update_chat_last_message
AFTER INSERT ON messages
BEGIN
    UPDATE chats SET last_message_at = CURRENT_TIMESTAMP WHERE id = NEW.chat_id;
END;

-- 샘플 데이터 (개발용)
-- 관리자 계정
INSERT INTO users (username, email, password_hash, is_admin) 
VALUES ('admin', 'admin@example.com', '$2b$12$YourHashedPasswordHere', TRUE);

-- 일반 사용자
INSERT INTO users (username, email, password_hash) 
VALUES ('testuser', 'test@example.com', '$2b$12$YourHashedPasswordHere');

-- 기본 캐릭터
INSERT INTO characters (name, system_prompt, created_by) 
VALUES 
('친절한 도우미', '당신은 친절하고 도움이 되는 AI 도우미입니다. 사용자의 질문에 정확하고 유용한 답변을 제공하세요.', 1),
('전문 상담사', '당신은 전문적인 상담사입니다. 사용자의 고민을 경청하고 공감하며 건설적인 조언을 제공하세요.', 1),
('창의적 작가', '당신은 창의적인 작가입니다. 상상력이 풍부하고 흥미로운 이야기를 만들어내세요.', 1);

-- 공용 프롬프트
INSERT INTO common_prompts (name, prompt_text) 
VALUES 
('한국어 응답', '모든 응답은 한국어로 작성해주세요.'),
('간결한 응답', '응답은 간결하고 핵심적으로 작성해주세요.'),
('예시 포함', '가능한 경우 구체적인 예시를 포함해서 설명해주세요.');