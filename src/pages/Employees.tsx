import React, {useState} from "react";
import {Button} from "@mui/material";







const Employees = () => {
    const handleClick= () => setSearchValue(true);
    const [searchValue, setSearchValue] = useState(false);
    const [open, setOpen] = useState(false);

return (
    <Button onClick={handleClick} variant="text">Text</Button>
)

}

export default Employees;
