import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Initial.css";

function Initial() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Initial page</h1>
      <button className="initial" onClick={() => navigate("/myStock")}>Mi Stock</button>
      <button className="initial" onClick={() => navigate("/myDiets")}>Mis Dietas</button>
      <button className="initial" onClick={() => navigate("/addDiet")}>Nueva Dieta</button>
      <button className="initial" onClick={() => navigate("/newShopping")}>Nueva Compra</button>
    </div>
  );
}

export default Initial