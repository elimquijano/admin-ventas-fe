import React, { useState, useRef } from 'react';
import { Button, ButtonGroup, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useEffect } from 'react';
const ComboBoxButton = ({ className, color, icon, items = [], itemSelect = 0, onClick = () => {}, onChangeItem }) => {
  const [selectedIndex, setSelectedIndex] = useState(itemSelect);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleMenuItemClick = async (index, id) => {
    const response = await onChangeItem(id);
    if (response?.success) {
      setSelectedIndex(index);
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setSelectedIndex(itemSelect);
  }, [itemSelect]);

  return (
    <>
      {items.length > 0 ? (
        <>
          <ButtonGroup variant="contained" ref={anchorRef} aria-label="Button group with a nested menu" color={color} fullWidth>
            <Button type="button" variant="contained" className={className} onClick={() => onClick()}>
              {icon}
              <Stack direction="row" justifyContent="center">
                <Typography noWrap>{items[selectedIndex]?.name}</Typography>
              </Stack>
            </Button>
            <Button
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={handleToggle}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Menu
            id="split-button-menu"
            anchorEl={anchorRef.current}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'split-button'
            }}
            sx={{ zIndex: 0 }}
          >
            {items.map((item, index) => (
              <MenuItem key={index} selected={index === selectedIndex} onClick={() => handleMenuItemClick(index, item?.id)}>
                {item?.name}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <Button type="button" fullWidth variant="contained" className={className} onClick={() => {}}>
          {icon}
          <Stack direction="row" justifyContent="center">
            <Typography noWrap>No tiene</Typography>
          </Stack>
        </Button>
      )}
    </>
  );
};

export default ComboBoxButton;
