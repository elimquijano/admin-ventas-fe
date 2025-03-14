import { Backspace, DeleteSweep, Login } from '@mui/icons-material';
import { Button, Paper, TextField } from '@mui/material';
import { useState } from 'react';

const ButtonsTouch = ({ child, variant, color, onClick }) => {
  return (
    <Button variant={variant} color={color} onClick={onClick} className="h2 m-0" style={{ width: '75px', height: '75px' }}>
      {child}
    </Button>
  );
};

const LoginButtons = ({ titulo, label, onSubmitLoginForm }) => {
  const [inputText, setInputText] = useState('');
  const handleSubmit = () => {
    onSubmitLoginForm(inputText);
    setInputText('');
  };
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleInputValue = (event) => {
    const newValue = event.target.innerText;
    setInputText(inputText + newValue);
  };
  const deleteCharacter = () => {
    const oldValue = inputText;
    if (oldValue.length > 0) {
      const newValue = oldValue.slice(0, oldValue.length - 1);
      setInputText(newValue);
    }
  };
  const cleanInputText = () => {
    setInputText('');
  };
  const buttons = [
    { child: '7', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '8', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '9', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '4', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '5', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '6', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '1', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '2', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: '3', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: <DeleteSweep />, variant: 'contained', color: 'error', onClick: cleanInputText },
    { child: '0', variant: 'contained', color: 'primary', onClick: handleInputValue },
    { child: <Backspace />, variant: 'contained', color: 'error', onClick: deleteCharacter }
  ];
  return (
    <Paper className="p-4 d-flex flex-column align-items-center" elevation={6}>
      {titulo && <h2>{titulo}</h2>}
      {label && <TextField fullWidth label={label} value={inputText} type="number" className="my-4" onChange={handleInputChange} />}
      <div className="d-flex" style={{ width: '300px' }}>
        <div className="flex-grow-1">
          {buttons.map((b, index) => (
            <ButtonsTouch key={index} child={b.child} variant={b.variant} color={b.color} onClick={b.onClick} />
          ))}
        </div>
        <div>
          <Button variant="contained" color="success" className="h-100" onClick={() => handleSubmit()} sx={{ width: '75px' }}>
            <Login className="h2" />
          </Button>
        </div>
      </div>
    </Paper>
  );
};

export default LoginButtons;
