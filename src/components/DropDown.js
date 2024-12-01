import React, { useState } from "react";
import Select from 'react-select';

function DropDown({onSelect, options, predeterminated, boolDays, daysStatus}) {
    const [selected, setSelected] = useState(predeterminated);

    const handleOptionChange = (option) => {
        setSelected(option);
        onSelect(option);
    };

    const getOptionBackgroundColor = (index) => {
    if (boolDays && daysStatus) {
        return daysStatus[index] ? '#73ce61' : '#f16c6c'; // Verde si hay datos, rojo si no
    }
    return ''; // Si no es el caso de los días, no se aplica color especial
    };

    // Modificar las opciones para aplicar color dinámico
    const modifiedOptions = options.map((option, index) => ({
    ...option,
    style: {
        backgroundColor: getOptionBackgroundColor(index), // Aplicar color de fondo
        color: 'white', // Asegurarse de que el texto sea blanco sobre el fondo
    },
    }));

    return (
        <div>
            <Select
            isSearchable={false}
            value={selected}
            onChange={handleOptionChange}
            options={modifiedOptions}
            styles={{
                control: (provided, state) => ({
                ...provided,
                color: state.isSelected ? 'white' : 'black',
                backgroundColor: 'none',
                border: 'none',
                width: 'auto',
                cursor: 'pointer',
                }),
                option: (provided, state) => ({
                ...provided,
                color: '#3b4252',
                backgroundColor: state.isSelected ? 'transparent' : (state.data.style ? state.data.style.backgroundColor : provided.backgroundColor),
                cursor: 'pointer',
                }),
            }}
            />
        </div>
    );
}

export default DropDown;