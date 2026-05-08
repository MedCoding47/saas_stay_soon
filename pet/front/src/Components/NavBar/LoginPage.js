import React from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import Navbar from "./Navbar";
import Footer from "../Footer/Footer";

const LoginPage = () => {
  return (
    <>
      <Navbar title="PawFinds" />
      <div className="login-page-container">
        <div className="login-page-content">
          <h1 className="login-title">Vos espaces personnels</h1>
          
          <div className="login-options">
            <Link to="/admin" className="login-option-button donor">
              Espace donateur/adhérent
            </Link>
            
            <Link to="/client/login" className="login-option-button adopter">
              Espace adoptant
            </Link>
          </div>
          
          <div className="no-account">
            <Link to="/client/register" className="no-account-link">
              Je n'ai pas encore de compte
            </Link>
          </div>
        </div>
      </div>
      <Footer title="PawFinds" />
    </>
  );
};

export default LoginPage;