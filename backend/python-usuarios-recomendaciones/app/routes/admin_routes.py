from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.services.admin_auth_service import AdminAuthService
from app.schemas.admin_schema import AdminCreate, AdminResponse, AdminLogin, AdminToken
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/auth/token")
admin_auth_service = AdminAuthService()

@router.post("/auth/login", response_model=AdminToken)
async def admin_login(admin_data: AdminLogin, db: Session = Depends(get_db)):
    admin = admin_auth_service.authenticate_admin(db, admin_data.username, admin_data.contraseña)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de administrador incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = admin_auth_service.create_access_token(data={"sub": admin.username})
    
    return AdminToken(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.from_orm(admin)
    )

@router.post("/auth/token")
async def admin_login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = admin_auth_service.authenticate_admin(db, form_data.username, form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de administrador incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = admin_auth_service.create_access_token(data={"sub": admin.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/create", response_model=AdminResponse)
async def create_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    # Solo para crear el primer admin o en desarrollo
    new_admin = admin_auth_service.create_admin(db, admin)
    return AdminResponse.from_orm(new_admin)