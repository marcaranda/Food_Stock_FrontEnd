import { useState, useEffect } from "react";
import { getUrl } from "../../data/Constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import Popover from '@mui/material/Popover';
import DropDown from "../../components/DropDown";
import Navbar from "../../components/Navbar";
import Swal from 'sweetalert2';
import axios from "axios";
import "../../styles/MyStock.css";

function MyStock() {
  const url = getUrl();

  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [booleanAddMeal, setBooleanAddMeal] = useState(false);
  const [stock, setStock] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        // Obtiene todos los registros de la tabla 'stock'
        axios.get(`${url}stock`)
          .then((response) => {
            setStock(response.data.stocks);
          })
      } catch (error) {
          console.error("Error al obtener el stock:", error);
      }
    }

    fetchStock();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (field, value) => {
    switch (field) {
      case "food":
        setFood(value);
        break;
      case "quantity":
        setQuantity(value);
        break;
      case "unit":
        setUnit(value);
        break;
      default:
        break;
    }
  };

  const handleInputUpdateChange = (index, value) => {
    const newStock = [...stock];
    newStock[index].quantity = value;
    setStock(newStock);
  }

  const handleSaveButton = async () => {
    const foodFormated = food.charAt(0).toUpperCase() + food.slice(1).toLowerCase();

    const mealData = {
      name: foodFormated,
      quantity,
      unit,
    };

    const newStock = [...stock];
    newStock.push(mealData);
    setStock(newStock);

    setFood("");
    setQuantity("");
    setUnit("g");

    try {
      // Guarda el mealData en MongoDB
      axios.post(`${url}stock`, mealData);

      Swal.fire({
        title: "Success!",
        text: "Comida guardada correctamente",
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al guardar la comida',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }

    setBooleanAddMeal(false);
  }

  const handleSaveUpdateButton = async (index) => {
    const food = stock[index];

    try {
      // Actualiza el registro en la tabla 'stock' con los datos de 'food'
      axios.put(`${url}stock`, food);

      Swal.fire({
        title: "Success!",
        text: "Comida actualizada correctamente",
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al guardar la comida',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
}

  const handleDeleteButton = async (index) => {
    const food = stock[index];
    
    const newStock = [...stock];
    newStock.splice(index, 1);
    setStock(newStock);

    try {
      // Elimina el registro de la tabla 'stock' basado en el identificador único
      axios.delete(`${url}stock/${food.name}`);

      Swal.fire({
        title: "Success!",
        text: "Comida eliminada correctamente",
        icon: "success"
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Error al eliminar la comida',
        icon: 'error',
        confirmButtonText: 'Cool'
      });
    }
  }

  const handleShowMacros = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div className="container">
      <div className="header">
        <Navbar />
      </div>
      <h1>Mi Stock</h1>

      <button onClick={() => setBooleanAddMeal(true)}>Añadir Comida</button>
      {booleanAddMeal && (
        <div className="new-food">
          <input
            type="text"
            placeholder="Alimento"
            onChange={(e) => handleInputChange("food", e.target.value)}
          />
          <input
            type="number"
            placeholder="Cantidad"
            onChange={(e) => handleInputChange("quantity", e.target.value)}
          />
          <DropDown
            options={[
              { value: 'g', label: 'Gramos (g)' },
              { value: 'u', label: 'Unidades (u)' },
            ]}
            predeterminated={{ value: 'g', label: 'Gramos (g)' }}
            onSelect={(selected) => handleInputChange("unit", selected.value)}
            boolDays={false}
          />
          <div className="buttons-new-food">
            <button onClick={handleSaveButton}>Guardar</button>
            <button onClick={() => setBooleanAddMeal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div>
        <h2 className="stock-title">Stock:</h2>
        {stock ? ( // Verifica si stock no es null
          <ul className="stock-list">
            {stock.map((food, i) => (
              <li className="stock-item" key={food.name}>
                <div className="stock-item-quantity">
                  <label className="heigth-center">{food.name}: </label>
                  <button onClick={handleShowMacros} className="info">
                    <FontAwesomeIcon icon={faInfo} />
                  </button>
                  <Popover
                    id="popover-basic"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}>
                      <div className="popover-container">
                        <h2>Macronutrientes cada 100g</h2>
                        <p>Calorías: {food.macros.calories}</p>
                        <p>Carbohidratos: {food.macros.carbs}</p>
                        <p>Grasas: {food.macros.fat}</p>
                        <p>Proteínas: {food.macros.protein}</p>
                      </div>
                  </Popover>
                  <input
                    id={`food-${food.name}`}
                    type="number"
                    value={food.quantity}
                    onChange={(e) => handleInputUpdateChange(i, e.target.value)}
                  />
                  <span className="heigth-center">{food.unit}</span>
                </div>
                <button className="update" onClick={() => handleSaveUpdateButton(i)}>Actualizar</button>
                <button className="delete" onClick={() => handleDeleteButton(i)}>Eliminar</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos en el stock.</p>
        )}
      </div>
    </div>
  );
}

export default MyStock