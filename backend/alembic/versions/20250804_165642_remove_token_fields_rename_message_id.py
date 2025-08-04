"""remove_token_fields_rename_message_id

Revision ID: 20250804165642
Revises: 1180249228c9
Create Date: 2025-08-04 16:56:42.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20250804165642'
down_revision: Union[str, None] = '1180249228c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create new messages table with updated schema
    op.create_table('messages_new',
        sa.Column('message_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('message_id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.ForeignKeyConstraint(['character_id'], ['characters.character_id'], )
    )
    op.create_index('ix_messages_new_user_id', 'messages_new', ['user_id'])
    op.create_index('ix_messages_new_character_id', 'messages_new', ['character_id'])
    
    # 2. Copy data from old messages table (excluding token fields)
    op.execute("""
        INSERT INTO messages_new (message_id, user_id, character_id, role, content, created_at)
        SELECT id, user_id, character_id, role, content, created_at FROM messages
    """)
    
    # 3. Create new usage_stats table without token fields
    op.create_table('usage_stats_new',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('usage_date', sa.Date(), nullable=False),
        sa.Column('chat_count', sa.Integer(), nullable=False, default=0),
        sa.Column('message_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.UniqueConstraint('user_id', 'usage_date')
    )
    
    # 4. Copy usage stats data (excluding token fields)
    op.execute("""
        INSERT INTO usage_stats_new (id, user_id, usage_date, chat_count, message_count, created_at, updated_at)
        SELECT id, user_id, usage_date, chat_count, message_count, created_at, updated_at FROM usage_stats
    """)
    
    # 5. Drop old tables and rename new ones
    op.drop_table('messages')
    op.drop_table('usage_stats')
    
    op.rename_table('messages_new', 'messages')
    op.rename_table('usage_stats_new', 'usage_stats')


def downgrade() -> None:
    # This migration cannot be easily reversed due to data loss
    raise NotImplementedError("This migration cannot be reversed due to removed token fields")