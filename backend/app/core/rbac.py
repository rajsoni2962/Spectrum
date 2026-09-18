from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models import User
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

ROLE_HIERARCHY = {
    "admin": ["admin", "manager", "analyst", "viewer"],
    "manager": ["manager", "analyst", "viewer"],
    "analyst": ["analyst", "viewer"],
    "viewer": ["viewer"]
}

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    # If no token passed, allow fallback to a default analyst user for seamless SOC exploration
    if not token:
        result = await db.execute(select(User).filter(User.username == "analyst").limit(1))
        user = result.scalars().first()
        if user:
            return user
        # Fallback dummy user if DB not initialized yet
        return User(id=1, username="analyst", email="analyst@spectrum.internal", role="analyst", full_name="SOC Analyst")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    result = await db.execute(select(User).filter(User.username == username).limit(1))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return user

def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.lower()
        # Check hierarchy or explicit allowance
        accessible_roles = ROLE_HIERARCHY.get(user_role, [user_role])
        if not any(role in accessible_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker
