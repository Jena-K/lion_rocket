"""add_avatar_url_to_character

Revision ID: 879d1347efac
Revises: 934925fd0dff
Create Date: 2025-08-04 15:28:30.987504

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '879d1347efac'
down_revision: Union[str, None] = '934925fd0dff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add avatar_url column to characters table
    op.add_column('characters', sa.Column('avatar_url', sa.String(500), nullable=True))
    
    # Update existing rows to set avatar_url to the character ID
    op.execute("""
        UPDATE characters 
        SET avatar_url = CAST(id AS TEXT)
    """)


def downgrade() -> None:
    # Remove avatar_url column
    op.drop_column('characters', 'avatar_url')
