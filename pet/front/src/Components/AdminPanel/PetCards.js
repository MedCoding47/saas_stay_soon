import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../config/api'; // Import the Axios instance

const PetCards = (props) => {
  const [showJustificationPopup, setShowJustificationPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const [showDeletedSuccess, setShowDeletedSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  const maxLength = 40;

  const formatTimeAgo = (updatedAt) => {
    const date = new Date(updatedAt);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await api.put(`/pets/${props.pet.id}/approve`, {
        status: "Approved"
      });

      if (response.status !== 200) {
        setShowErrorPopup(true);
      } else {
        setShowApproved(true);
      }
    } catch (err) {
      setShowErrorPopup(true);
    } finally {
      setIsApproving(false);
    }
  };

  const deleteFormsAdoptedPet = async () => {
    setIsDeleting(true);
    try {
      const deleteResponse = await api.delete(`/adoptions/${props.pet.id}`);
      if (deleteResponse.status !== 200) {
        throw new Error('Failed to delete forms');
      }
    } catch (err) {
      console.error('Error deleting forms:', err);
    } finally {
      handleReject();
    }
  };

  const handleReject = async () => {
    try {
      const response = await api.delete(`/pets/${props.pet.id}`);

      if (response.status !== 200) {
        setShowErrorPopup(true);
        throw new Error('Failed to delete pet');
      } else {
        setShowDeletedSuccess(true);
      }
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
          <img src={`//storage/${props.pet.image}`} alt={props.pet.name} />
        </div>
        <div className='pet-card-details'>
          <h2>{props.pet.name}</h2>
          <p><b>Type:</b> {props.pet.type}</p>
          <p><b>Age:</b> {props.pet.age}</p>
          <p><b>Location:</b> {props.pet.area}</p>
          <p><b>Owner Email:</b> {props.pet.email}</p>
          <p><b>Owner Phone:</b> {props.pet.phone}</p>
          <p>
            <b>Justification:</b>
            <span>
              {truncateText(props.pet.justification, maxLength)}
              {props.pet.justification.length > maxLength && (
                <span onClick={() => setShowJustificationPopup(!showJustificationPopup)} className='read-more-btn'>
                  Read More
                </span>
              )}
            </span>
          </p>
          <p>{formatTimeAgo(props.pet.updated_at)}</p>
        </div>
        <div className='app-rej-btn'>
          <button onClick={deleteFormsAdoptedPet} disabled={isDeleting || isApproving}>{isDeleting ? (<p>Deleting</p>) : (props.deleteBtnText)}</button>
          {props.approveBtn ?
            <button disabled={isDeleting || isApproving} onClick={handleApprove}>{isApproving ? (<p>Approving</p>) : 'Approve'}</button>
            : ''
          }
        </div>
        {showJustificationPopup && (
          <div className='popup'>
            <div className='popup-content'>
              <h4>Justification:</h4>
              <p>{props.pet.justification}</p>
            </div>
            <button onClick={() => setShowJustificationPopup(!showJustificationPopup)} className='close-btn'>
              Close <i className="fa fa-times"></i>
            </button>
          </div>
        )}
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
        {showApproved && (
          <div className='popup'>
            <div className='popup-content'>
              <p>Approval Successful...</p>
              <p>
                Please contact the customer at{' '}
                <a href={`mailto:${props.pet.email}`}>{props.pet.email}</a>{' '}
                or{' '}
                <a href={`tel:${props.pet.phone}`}>{props.pet.phone}</a>{' '}
                to arrange the transfer of the pet from the owner's home to our adoption center.
              </p>
            </div>
            <button onClick={() => {
              setShowApproved(!showApproved);
              props.updateCards();
            }} className='close-btn'>
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
              setShowDeletedSuccess(!showDeletedSuccess);
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

export default PetCards;