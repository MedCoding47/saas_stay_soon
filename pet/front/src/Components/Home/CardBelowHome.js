import React from 'react';
import HomeDarkCardLeftPic from "./images/HomeDarkCardLeftPic.png";
import HomeDarkCardRightPic from "./images/HomeDarkCardRightPic.png";

const CardBelowHome = () => {
  return (
    <div className='stats-container'>
      <div className='stats-content'>
        <div className='stat-item'>
          <img src={HomeDarkCardLeftPic} alt="Chien heureux" />
          <div className='stat-text'>
            <span className='stat-number'>30 000+</span>
            <span className='stat-label'>Animaux secourus chaque année</span>
          </div>
        </div>
        
        <div className='stat-item'>
          <img src={HomeDarkCardRightPic} alt="Chat heureux" />
          <div className='stat-text'>
            <span className='stat-number'>60+</span>
            <span className='stat-label'>Refuges en France</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardBelowHome;