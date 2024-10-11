import React, { useState } from "react";
import Select from 'react-select';
import styles from './DropDown.module.css';

function DropDown({onSelect, options, predeterminated}) {
    const [selected, setSelected] = useState(predeterminated);

    const handeOptionChange = (option) => {
        setSelected(option);
        onSelect(option);
    };

    return(
        <div className={styles['body']}>
            <Select
                isSearchable={false}
                value={selected}
                onChange={handeOptionChange}
                options={options}
                styles={{
                    control: (provided, state) => ({
                        ...provided,
                        color: state.isSelected ? 'white' : 'black',
                        backgroundColor: 'none',
                        border: 'none',
                        width: 'auto',
                        cursor: 'pointer'
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        color: '#3b4252',
                        backgroundColor: state.isSelected ? 'transparent' : provided.backgroundColor,
                        cursor: 'pointer'
                    })
                }}  
            >
            </Select>
        </div>
    )
}

export default DropDown;