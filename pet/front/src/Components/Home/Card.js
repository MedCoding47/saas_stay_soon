import React from "react";

const Card = (props) => {
  return (
    <div className="guide-card">
      <h3>{props.title}</h3>
      <p>{props.description}</p>
    </div>
  );
};

export default Card;