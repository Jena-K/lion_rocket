"""update_message_and_stats_models

Revision ID: update_message_stats
Revises: add_token_columns_to_usage_stats
Create Date: 2025-01-04 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'update_message_stats'
down_revision: Union[str, None] = 'add_token_columns'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add token_cost and last_message_at to messages table
    op.add_column('messages', sa.Column('token_cost', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('messages', sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add character_id to usage_stats table
    op.add_column('usage_stats', sa.Column('character_id', sa.Integer(), nullable=False, server_default='1'))
    
    # Create foreign key constraint for character_id
    op.create_foreign_key(
        'fk_usage_stats_character_id', 
        'usage_stats', 
        'characters', 
        ['character_id'], 
        ['character_id']
    )
    
    # Create index on character_id
    op.create_index('ix_usage_stats_character_id', 'usage_stats', ['character_id'])
    
    # Remove unused columns from usage_stats
    op.drop_column('usage_stats', 'message_count')
    op.drop_column('usage_stats', 'input_tokens')
    op.drop_column('usage_stats', 'output_tokens')
    
    # Update the unique constraint to include character_id
    op.drop_constraint('usage_stats_user_id_usage_date_key', 'usage_stats', type_='unique')
    op.create_unique_constraint(
        'usage_stats_user_id_character_id_usage_date_key',
        'usage_stats',
        ['user_id', 'character_id', 'usage_date']
    )


def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('usage_stats_user_id_character_id_usage_date_key', 'usage_stats', type_='unique')
    op.create_unique_constraint(
        'usage_stats_user_id_usage_date_key',
        'usage_stats',
        ['user_id', 'usage_date']
    )
    
    # Add back removed columns
    op.add_column('usage_stats', sa.Column('message_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('usage_stats', sa.Column('input_tokens', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('usage_stats', sa.Column('output_tokens', sa.Integer(), nullable=False, server_default='0'))
    
    # Drop index and foreign key
    op.drop_index('ix_usage_stats_character_id', 'usage_stats')
    op.drop_constraint('fk_usage_stats_character_id', 'usage_stats', type_='foreignkey')
    
    # Remove character_id from usage_stats
    op.drop_column('usage_stats', 'character_id')
    
    # Remove columns from messages table
    op.drop_column('messages', 'last_message_at')
    op.drop_column('messages', 'token_cost')