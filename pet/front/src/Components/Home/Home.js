import React from "react";
import HomeLandingContainer from "./HomeLandingContainer";
import CardBelowHome from "./CardBelowHome";
import PlanningToAdoptAPet from "./PlanningToAdoptAPet";
import FeaturedPets from "./FeaturedPets"; // Ajoutez cette ligne
import ResponsibleAdoption from "./ResponsibleAdoption";

const Home = () => {
  return (
    <main>
      <HomeLandingContainer 
        description="La SPA recueille chaque année des milliers d'animaux abandonnés. Trouvez celui qui saura vous apporter bonheur et affection."
      />
      <CardBelowHome />
      <ResponsibleAdoption />

      <FeaturedPets /> {/* Ajoutez ce composant ici */}
      <PlanningToAdoptAPet />
    </main>
  );
};

export default Home;