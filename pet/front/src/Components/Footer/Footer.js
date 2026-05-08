import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-column">
        <h4>La SPA</h4>
        <ul>
          <li><Link to="/about">Qui sommes-nous ?</Link></li>
          <li><Link to="/missions">Nos missions</Link></li>
          <li><Link to="/values">Nos valeurs</Link></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Adoption</h4>
        <ul>
          <li><Link to="/process">Processus d'adoption</Link></li>
          <li><Link to="/requirements">Conditions</Link></li>
          <li><Link to="/faq">FAQ Adoption</Link></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Nous aider</h4>
        <ul>
          <li><Link to="/donate">Faire un don</Link></li>
          <li><Link to="/volunteer">Bénévolat</Link></li>
          <li><Link to="/foster">Famille d'accueil</Link></li>
        </ul>
      </div>
      <div className="footer-column">
        <h4>Contact</h4>
        <ul>
          <li><Link to="/contact">Nous contacter</Link></li>
          <li><Link to="/shelters">Nos refuges</Link></li>
          <li><Link to="/press">Espace presse</Link></li>
        </ul>
      </div>
      <div className="copyright">
        <p>La SPA - Copyright {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;