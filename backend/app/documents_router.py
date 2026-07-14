"""My Documents: list, fetch, and delete a user's previously drafted documents."""

from fastapi import APIRouter, Depends, HTTPException, status

from app import documents
from app.auth.deps import get_current_user
from app.schemas import DocumentDetail, DocumentSummary, UserResponse

router = APIRouter(prefix="/api/documents", tags=["documents"])

NOT_FOUND = HTTPException(status.HTTP_404_NOT_FOUND, "Document not found.")


@router.get("", response_model=list[DocumentSummary])
def list_documents(current_user: UserResponse = Depends(get_current_user)) -> list[DocumentSummary]:
    return documents.list_for_user(current_user.id)


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: int, current_user: UserResponse = Depends(get_current_user)
) -> DocumentDetail:
    document = documents.get_owned(document_id, current_user.id)
    if document is None:
        raise NOT_FOUND
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, current_user: UserResponse = Depends(get_current_user)) -> None:
    if not documents.delete_owned(document_id, current_user.id):
        raise NOT_FOUND
