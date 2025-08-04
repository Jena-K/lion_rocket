"""Add token columns to usage_stats table

Revision ID: add_token_columns
Revises: aa66493c0976
Create Date: 2025-08-04 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_token_columns'
down_revision = 'aa66493c0976'
branch_labels = None
depends_on = None

def upgrade():
    """Add token tracking columns to usage_stats table"""
    
    # Add the new token columns to usage_stats table
    op.add_column('usage_stats', sa.Column('token_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('usage_stats', sa.Column('input_tokens', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('usage_stats', sa.Column('output_tokens', sa.Integer(), nullable=False, server_default='0'))
    
    # Added token columns to usage_stats table

def downgrade():
    """Remove token tracking columns from usage_stats table"""
    
    # Remove the token columns
    op.drop_column('usage_stats', 'output_tokens')
    op.drop_column('usage_stats', 'input_tokens')
    op.drop_column('usage_stats', 'token_count')
    
    # Removed token columns from usage_stats table