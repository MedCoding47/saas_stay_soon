import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import "./UserManagement.css"
const UserCard = ({ user, onEdit, onDelete }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">
          {user.name} 
          {user.is_admin && <Badge bg="danger" className="ms-2">Admin</Badge>}
        </h5>
        <p className="card-text">
          <strong>Email:</strong> {user.email}<br />
          <strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}<br />
          <strong>Verified:</strong> {user.email_verified_at ? 'Yes' : 'No'}
        </p>
        <div className="d-flex justify-content-between">
          <Button variant="outline-primary" size="sm" onClick={() => onEdit(user)}>
            Edit
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => onDelete(user.id)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;