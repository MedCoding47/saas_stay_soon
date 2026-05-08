import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../config/api';

const AdoptedCards = (props) => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const [showDeletedSuccess, setshowDeletedSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatTimeAgo = (updatedAt) => {
    const date = new Date(updatedAt);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleReject = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/pets/${props.pet.id}`);
      setshowDeletedSuccess(true);
    } catch (err) {
      setShowErrorPopup(true);
      console.error('Error deleting pet:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='req-containter'>
      <div className='pet-view-card'>
        <div className='pet-card-pic'>
          <img src={`/storage/${props.pet.image}`} alt={props.pet.name} />
        </div>
        <div className='pet-card-details'>
          <h2>{props.pet.name}</h2>
          <p><b>Type:</b> {props.pet.type}</p>
          <p><b>New Owner Email:</b> {props.pet.email}</p>
          <p><b>New Owner Phone:</b> {props.pet.phone}</p>
          <p><b>Adopted: </b>{formatTimeAgo(props.pet.updated_at)}</p>
        </div>
        <div className='app-rej-btn'>
          <button onClick={handleReject} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : props.deleteBtnText}
          </button>
        </div>
        {showErrorPopup && (
          <div className='popup'>
            <div className='popup-content'>
              <p>Oops!... Connection Error</p>
            </div>
            <button onClick={() => setShowErrorPopup(!showErrorPopup)} className='close-btn'>
              Close <i className="fa fa-times"></i>
            </button>
          </div>
        )}
        {showDeletedSuccess && (
          <div className='popup'>
            <div className='popup-content'>
              <p>Deleted Successfully from Database...</p>
            </div>
            <button onClick={() => {
              setshowDeletedSuccess(!showDeletedSuccess);
              props.updateCards();
            }} className='close-btn'>
              Close <i className="fa fa-times"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoptedCards;