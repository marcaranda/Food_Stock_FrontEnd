import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUrl } from "../../data/Constants";
import DropDown from "../../components/DropDown";
import Swal from 'sweetalert2';
import axios from "axios";
import "../../styles/NewShopping.css";

function NewShopping() {
  const navigate = useNavigate();
  const url = getUrl();
  const [diets, setDiets] = useState([]);
  const [dietNames, setDietNames] = useState([]);
  const [stock, setStock] = useState(null);
  const [selectedDietTotalFood, setSelectedDietTotalFood] = useState(null); // Cambiado a null
  const [missingItems, setMissingItems] = useState([]); // Estado para los alimentos faltantes

  useEffect(() => {
    const fetchDietNames = async () => {
      try {
        axios.get(`${url}diet`)
          .then((response) => {
            const dietsData = response.data.diets;
            setDiets(dietsData); // Guarda los datos de las dietas en el estado
            const dietNamesList = dietsData.map(diet => diet.name); // Suponiendo que la columna se llama 'diet_name'
            setDietNames(dietNamesList); // Guarda los nombres de las dietas en el estado
          })
      } catch (error) {
        console.error("Error al obtener los nombres de las dietas:", error);
      }

      try {
        // Obtiene todos los registros de la tabla 'stock'
        axios.get(`${url}stock`)
          .then((response) => {
            setStock(response.data.stocks);
          })
      } catch (error) {
          console.error("Error al obtener el stock:", error);
      }
    };

    fetchDietNames(); // Ejecuta la función cuando se carga el componente
    // eslint-disable-next-line
  }, []);

  const handleSelectChange = (selected) => {
    const selectedDietDoc = diets.find((diet) => diet.name === selected);
    const dietData = selectedDietDoc ? selectedDietDoc.totalFood : null;
    setSelectedDietTotalFood(dietData);
    if (dietData && stock) {
      calculateMissingItems(dietData, stock);
    }
  };

  // Función para calcular los alimentos faltantes
  const calculateMissingItems = (diet, stock) => {
    const missing = [];

    // eslint-disable-next-line
    diet.map((food) => {
      const stockItem = stock.find((item) => item.name === food.name);

      if (stockItem) {
        const stockQuantity = stockItem.quantity;
        if (stockQuantity < food.quantity) {
          missing.push({
            name: food.name,
            missingQuantity: food.quantity - stockQuantity,
            unit: food.unit,
          });
        }
      }
      else {
        missing.push({
          name: food.name,
          missingQuantity: food.quantity,
          unit: food.unit,
        });
      }
    });

    console.log(missing);
    // Guardamos los alimentos faltantes en el estado
    setMissingItems(missing);
  };

  const handleInputUpdateChange = (index, value) => {
    const newMissingItems = [...missingItems];
    newMissingItems[index].missingQuantity = value;
    setMissingItems(newMissingItems);
  }

  const handleComprarButton = (food) => {
    const newStock = [...stock];
    let stockItem = newStock.find((item) => item.name === food.name);

    if (stockItem) {
      stockItem.quantity += parseFloat(food.missingQuantity);
    } 
    else {
      stockItem = {
        name: food.name,
        quantity: parseFloat(food.missingQuantity),
        unit: food.unit,
      };

      newStock.push(stockItem);
    }
    console.log("stockItem", stockItem); 
    saveCompra(stockItem);

    setStock(newStock);
    calculateMissingItems(selectedDietTotalFood, newStock);
  }

  const saveCompra = async (stockItem) => {
    try {
      // Guarda el stockItem en MongoDB
      axios.put(`${url}stock`, stockItem);

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
  }

  return (
    <div className="container">
      <div className="header">
      <button onClick={() => navigate("/")}>Inicio</button>
      <button onClick={() => navigate("/myStock")}>Stock</button>
      </div>
      <h1>Nueva Compra</h1>

      <DropDown
        options={dietNames.map((dietName) => ({ value: dietName, label: dietName }))}
        predeterminated={{ value: '', label: 'Selecciona una dieta' }}
        onSelect={(selected) => handleSelectChange(selected.value)}
        boolDays={false}
      />

      <div className="space-container">
        <h2 className="title">Total de Alimentos:</h2>
        {selectedDietTotalFood ? (
          <ul>
            {selectedDietTotalFood.map((food, index) => (
              <li key={index}>
                <b>{food.name}</b>: {food.quantity} {food.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos para mostrar.</p>
        )}
      </div>

      <div className="space-container">
        <h2 className="title">Stock:</h2>
        {stock ? (
          <ul>
            {stock.map((food) => (
              <li key={food.name}>
                <b>{food.name}</b>: {food.quantity} {food.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos en el stock.</p>
        )}
      </div>

      <div className="space-container">
        <h2 className="title">Alimentos faltantes:</h2>
        {missingItems.length > 0 ? (
          <ul className="missing-list">
            {missingItems.map((food, i) => (
              <li key={food.name}  className="missing-item">
                <div className="missing-item-quantity">
                  <label htmlFor={`food-${food.name}`}><b>{food.name}</b>: Faltan por comprar</label>
                  <input
                  id={`food-${food.name}`}
                  type="number"
                  value={food.missingQuantity}
                  onChange={(e) => handleInputUpdateChange(i, e.target.value)} // Aquí puedes manejar el cambio
                  />
                  <span>{food.unit}</span>
                </div>
                <button onClick={() => handleComprarButton(food)}>Comprar</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay alimentos faltantes.</p>
        )}
      </div>
    </div>
  );
}

export default NewShopping;
