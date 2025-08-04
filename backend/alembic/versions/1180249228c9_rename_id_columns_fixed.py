"""rename_id_columns_fixed

Revision ID: 1180249228c9
Revises: 879d1347efac
Create Date: 2025-08-04 15:47:18.036349

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1180249228c9'
down_revision: Union[str, None] = '879d1347efac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Due to SQLite limitations, we need to recreate tables to rename primary keys
    
    # 0. Clean up any leftover temp tables from previous failed migrations
    op.execute("DROP TABLE IF EXISTS users_new")
    op.execute("DROP TABLE IF EXISTS characters_new")
    op.execute("DROP TABLE IF EXISTS usage_stats_new")
    op.execute("DROP TABLE IF EXISTS conversation_summaries_new")
    
    # 1. Create new users table with user_id as primary key
    op.create_table('users_new',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(50), nullable=False),
        sa.Column('email', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('is_admin', sa.Boolean(), nullable=False, default=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )
    
    # 2. Create new characters table with character_id as primary key
    op.create_table('characters_new',
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('gender', sa.String(6), nullable=False),
        sa.Column('intro', sa.Text(), nullable=False),
        sa.Column('personality_tags', sa.JSON(), nullable=False),
        sa.Column('interest_tags', sa.JSON(), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('character_id'),
        sa.ForeignKeyConstraint(['created_by'], ['users_new.user_id'], )
    )
    
    # 3. Copy data from old tables to new tables
    op.execute("""
        INSERT INTO users_new (user_id, username, email, password_hash, is_admin, is_active, created_at, updated_at)
        SELECT id, username, email, password_hash, is_admin, is_active, created_at, updated_at FROM users
    """)
    
    op.execute("""
        INSERT INTO characters_new (character_id, name, gender, intro, personality_tags, interest_tags, prompt, avatar_url, created_by, is_active, created_at, updated_at)
        SELECT id, name, gender, intro, personality_tags, interest_tags, prompt, avatar_url, created_by, is_active, created_at, updated_at FROM characters
    """)
    
    # 4. Drop old messages table and create new one with updated foreign keys
    op.drop_table('messages')
    
    op.create_table('messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_from_user', sa.Boolean(), nullable=False, default=True),
        sa.Column('token_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.user_id'], ),
        sa.ForeignKeyConstraint(['character_id'], ['characters_new.character_id'], )
    )
    op.create_index('ix_messages_user_id', 'messages', ['user_id'])
    op.create_index('ix_messages_character_id', 'messages', ['character_id'])
    
    # 5. Update usage_stats table
    op.create_table('usage_stats_new',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('usage_date', sa.Date(), nullable=False),
        sa.Column('chat_count', sa.Integer(), nullable=False, default=0),
        sa.Column('message_count', sa.Integer(), nullable=False, default=0),
        sa.Column('total_tokens', sa.Integer(), nullable=False, default=0),
        sa.Column('input_tokens', sa.Integer(), nullable=False, default=0),
        sa.Column('output_tokens', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.user_id'], ),
        sa.UniqueConstraint('user_id', 'usage_date')
    )
    
    op.execute("""
        INSERT INTO usage_stats_new (id, user_id, usage_date, chat_count, message_count, total_tokens, input_tokens, output_tokens, created_at, updated_at)
        SELECT id, user_id, usage_date, chat_count, message_count, total_tokens, input_tokens, output_tokens, created_at, updated_at FROM usage_stats
    """)
    
    # 6. Update conversation_summaries table (drop and recreate with new foreign keys)
    op.drop_table('conversation_summaries')
    
    op.create_table('conversation_summaries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('message_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users_new.user_id'], ),
        sa.ForeignKeyConstraint(['character_id'], ['characters_new.character_id'], )
    )
    op.create_index('ix_conversation_summaries_user_id', 'conversation_summaries', ['user_id'])
    op.create_index('ix_conversation_summaries_character_id', 'conversation_summaries', ['character_id'])
    
    # 7. Drop old chats table if it exists
    op.execute("DROP TABLE IF EXISTS chats")
    
    # 8. Drop old tables and rename new ones
    op.drop_table('users')
    op.drop_table('characters')
    op.drop_table('usage_stats')
    
    op.rename_table('users_new', 'users')
    op.rename_table('characters_new', 'characters')
    op.rename_table('usage_stats_new', 'usage_stats')
    
    # Create indexes on renamed tables
    op.create_index('ix_users_user_id', 'users', ['user_id'])
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_characters_character_id', 'characters', ['character_id'])
    op.create_index('ix_characters_name', 'characters', ['name'])


def downgrade() -> None:
    # This would be complex to reverse, so we'll raise an error
    raise NotImplementedError("This migration cannot be reversed due to primary key changes")
