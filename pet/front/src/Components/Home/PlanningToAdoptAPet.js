import React from 'react';
import Card from "./Card";

const PlanningToAdoptAPet = () => {
  return (
    <div className='adoption-guide-container'>
      <h2>Prêt à adopter ?</h2>
      <p className='subtitle'>Tout ce que vous devez savoir avant d'adopter</p>
      
      <div className='guide-cards'>
        <Card 
          title="Pourquoi adopter ?" 
          description="Adopter un animal, c'est lui offrir une seconde chance. C'est aussi un acte responsable qui contribue à lutter contre l'abandon."
        />
        <Card 
          title="Comment adopter ?" 
          description="Rendez-vous dans l'un de nos refuges ou parcourez nos annonces en ligne. Nos équipes vous guideront dans votre choix."
        />
        <Card 
          title="Nos engagements" 
          description="Tous nos animaux sont identifiés, vaccinés et stérilisés. Nous veillons à leur bien-être avant et après l'adoption."
        />
      </div>
    </div>
  );
}

export default PlanningToAdoptAPet;