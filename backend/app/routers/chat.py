from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Character
from app.schemas import (
    ChatCreate,
    ChatResponse,
    ChatWithMessages,
    ChatCreateWithMessage,
    MessageCreate,
    MessageResponse,
    MessageRole,
    PaginatedResponse,
    PaginationParams,
)
from app.services import claude_service, chat_service
from app.middleware.rate_limit import chat_rate_limit

router = APIRouter()


@router.get("/", response_model=PaginatedResponse)
async def get_user_chats(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all chats for the current user with pagination"""
    skip = (page - 1) * limit

    # Get total count
    total = chat_service.get_chat_count_for_user(db, current_user.id)

    # Get paginated chats
    chats = chat_service.get_user_chats(db, current_user.id, skip, limit)

    # Convert to response schema
    chat_responses = []
    for chat in chats:
        chat_response = ChatResponse.from_orm(chat)
        chat_responses.append(chat_response)

    return PaginatedResponse(
        items=chat_responses,
        total=total,
        page=page,
        pages=(total + limit - 1) // limit,
        limit=limit,
    )


@router.post("/", response_model=ChatResponse)
async def create_chat(
    chat_data: ChatCreateWithMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new chat session"""
    # Verify character exists
    character = db.query(Character).filter(Character.id == chat_data.character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Create chat
    chat = chat_service.create_chat(db, current_user.id, chat_data.character_id)

    # Add initial message if provided
    if chat_data.initial_message:
        chat_service.add_message(
            db,
            chat.id,
            MessageRole.USER,
            chat_data.initial_message,
            claude_service.count_tokens(chat_data.initial_message),
        )

    return ChatResponse.from_orm(chat)


@router.get("/{chat_id}", response_model=ChatWithMessages)
async def get_chat_details(
    chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get chat details with messages"""
    chat = chat_service.get_chat_by_id(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Get messages
    messages = chat_service.get_chat_messages(db, chat_id, limit=50)

    # Get character details
    character = db.query(Character).filter(Character.id == chat.character_id).first()

    # Build response
    chat_response = ChatWithMessages.from_orm(chat)
    chat_response.character = character
    chat_response.messages = messages
    chat_response.message_count = chat_service.get_message_count_for_chat(db, chat_id)

    return chat_response


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Delete a chat session"""
    if not chat_service.delete_chat(db, chat_id, current_user.id):
        raise HTTPException(status_code=404, detail="Chat not found")

    return {"message": "Chat deleted successfully"}


@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(
    chat_id: int,
    limit: Optional[int] = Query(None, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get messages for a specific chat"""
    # Verify chat belongs to user
    chat = chat_service.get_chat_by_id(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Get messages
    messages = chat_service.get_chat_messages(db, chat_id, limit)

    return [MessageResponse.from_orm(msg) for msg in messages]


@router.post("/{chat_id}/messages", response_model=MessageResponse)
@chat_rate_limit()
async def send_message(
    request: Request,
    chat_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message and get AI response"""
    # Verify chat belongs to user
    chat = chat_service.get_chat_by_id(db, chat_id, current_user.id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Get character
    character = db.query(Character).filter(Character.id == chat.character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    # Count tokens for user message
    user_tokens = claude_service.count_tokens(message_data.content)

    # Save user message
    user_message = chat_service.add_message(
        db, chat_id, MessageRole.USER, message_data.content, user_tokens
    )

    try:
        # Get chat history (last 20 messages for context)
        messages = chat_service.get_chat_messages(db, chat_id, limit=20)

        # Generate AI response
        response_text, input_tokens, output_tokens = await claude_service.generate_response(
            messages[:-1], character, message_data.content  # Exclude the just-added user message
        )

        # Save AI response
        ai_message = chat_service.add_message(
            db, chat_id, MessageRole.ASSISTANT, response_text, output_tokens
        )

        # Update usage statistics
        total_tokens = input_tokens + output_tokens
        chat_service.update_usage_stats(db, current_user.id, total_tokens)

        return MessageResponse.from_orm(ai_message)

    except Exception as e:
        # If AI generation fails, still return the user message
        # Log the error for debugging
        print(f"AI generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate AI response: {str(e)}")
