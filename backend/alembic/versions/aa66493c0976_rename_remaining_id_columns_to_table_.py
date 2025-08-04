"""rename_remaining_id_columns_to_table_singular_id

Revision ID: aa66493c0976
Revises: 20250804165642
Create Date: 2025-08-04 17:37:14.479329

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa66493c0976'
down_revision: Union[str, None] = '20250804165642'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Due to SQLite limitations, we need to recreate tables to rename primary keys
    
    # 1. Create new usage_stats table with usage_stat_id as primary key
    op.create_table('usage_stats_new',
        sa.Column('usage_stat_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('usage_date', sa.Date(), nullable=False),
        sa.Column('chat_count', sa.Integer(), nullable=False, default=0),
        sa.Column('message_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('usage_stat_id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.UniqueConstraint('user_id', 'usage_date')
    )
    
    # 2. Copy data from old usage_stats table
    op.execute("""
        INSERT INTO usage_stats_new (usage_stat_id, user_id, usage_date, chat_count, message_count, created_at, updated_at)
        SELECT id, user_id, usage_date, chat_count, message_count, created_at, updated_at FROM usage_stats
    """)
    
    # 3. Create new conversation_summaries table with conversation_summary_id as primary key
    op.create_table('conversation_summaries_new',
        sa.Column('conversation_summary_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('character_id', sa.Integer(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('message_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('conversation_summary_id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.ForeignKeyConstraint(['character_id'], ['characters.character_id'], )
    )
    
    # 4. Copy data from old conversation_summaries table
    op.execute("""
        INSERT INTO conversation_summaries_new (conversation_summary_id, user_id, character_id, summary, message_count, created_at)
        SELECT id, user_id, character_id, summary, message_count, created_at FROM conversation_summaries
    """)
    
    # 5. Drop old tables and rename new ones
    op.drop_table('usage_stats')
    op.drop_table('conversation_summaries')
    
    op.rename_table('usage_stats_new', 'usage_stats')
    op.rename_table('conversation_summaries_new', 'conversation_summaries')
    
    # 6. Create indexes on renamed tables
    op.create_index('ix_usage_stats_usage_stat_id', 'usage_stats', ['usage_stat_id'])
    op.create_index('ix_usage_stats_user_id', 'usage_stats', ['user_id'])
    op.create_index('ix_usage_stats_usage_date', 'usage_stats', ['usage_date'])
    
    op.create_index('ix_conversation_summaries_conversation_summary_id', 'conversation_summaries', ['conversation_summary_id'])
    op.create_index('ix_conversation_summaries_user_id', 'conversation_summaries', ['user_id'])
    op.create_index('ix_conversation_summaries_character_id', 'conversation_summaries', ['character_id'])


def downgrade() -> None:
    # This migration cannot be easily reversed due to primary key changes
    raise NotImplementedError("This migration cannot be reversed due to primary key changes")
