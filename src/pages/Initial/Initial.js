import React from "react";
import { useNavigate } from "react-router-dom";

function Initial() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Initial page</h1>
      <button onClick={() => navigate("/myStock")}>Mi Stock</button>
      <button onClick={() => navigate("/myDiets")}>Mis Dietas</button>
      <button onClick={() => navigate("/addDiet")}>Nueva Dieta</button>
      <button onClick={() => navigate("/newShopping")}>Nueva Compra</button>
    </div>
  );
}

export default Initial