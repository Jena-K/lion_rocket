"""rename messages table to chats and message_id to chat_id

Revision ID: rename_messages_to_chats
Revises: aa66493c0976
Create Date: 2025-01-04 17:00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'rename_messages_to_chats'
down_revision = 'aa66493c0976'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if old tables exist before dropping
    inspector = sa.inspect(op.get_bind())
    existing_tables = inspector.get_table_names()
    
    if 'chat_sessions' in existing_tables:
        op.drop_table('chat_sessions')
    if 'session_messages' in existing_tables:
        op.drop_table('session_messages')
    
    # Rename messages table to chats
    op.rename_table('messages', 'chats')
    
    # For SQLite, we need to recreate the table to rename the primary key column
    # SQLite doesn't support ALTER COLUMN directly
    with op.batch_alter_table('chats') as batch_op:
        batch_op.alter_column('message_id', new_column_name='chat_id')


def downgrade() -> None:
    # Create old tables
    op.create_table('chat_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('last_chat_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['character_id'], ['characters.character_id'], ondelete='CASCADE')
    )
    op.create_index(op.f('ix_chat_sessions_id'), 'chat_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_chat_sessions_user_id'), 'chat_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_chat_sessions_character_id'), 'chat_sessions', ['character_id'], unique=False)
    
    op.create_table('session_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chat_session_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['chat_session_id'], ['chat_sessions.id'], ondelete='CASCADE')
    )
    op.create_index(op.f('ix_session_messages_id'), 'session_messages', ['id'], unique=False)
    op.create_index(op.f('ix_session_messages_chat_session_id'), 'session_messages', ['chat_session_id'], unique=False)
    
    # Rename chats table back to messages
    op.rename_table('chats', 'messages')
    
    # Rename chat_id column back to message_id
    op.alter_column('messages', 'chat_id',
                    new_column_name='message_id')
    
    # Update the primary key constraint name
    op.execute('ALTER TABLE messages DROP CONSTRAINT IF EXISTS chats_pkey CASCADE')
    op.execute('ALTER TABLE messages ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id)')
    
    # Update index names back
    op.execute('ALTER INDEX IF EXISTS ix_chats_chat_id RENAME TO ix_messages_message_id')
    op.execute('ALTER INDEX IF EXISTS ix_chats_user_id RENAME TO ix_messages_user_id')
    op.execute('ALTER INDEX IF EXISTS ix_chats_character_id RENAME TO ix_messages_character_id')