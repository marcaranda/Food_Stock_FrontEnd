import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom"

import Initial from "./pages/Initial/Initial"
import MyDiets from "./pages/Diet/MyDiets"
import DietDetails from "./pages/Diet/DietDetails"
import AddDiet from "./pages/Diet/AddDiet"
import MyStock from './pages/Stock/MyStock';
import NewShopping from './pages/Shopping/NewShopping';

function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<Initial/>} />
      <Route path="/myDiets" element={<MyDiets/>} />
      <Route path="/myDiets/:dietName" element={<DietDetails/>} />
      <Route path="/addDiet" element={<AddDiet/>} />
      <Route path="/myStock" element={<MyStock/>} />
      <Route path="/newShopping" element={<NewShopping/>} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
