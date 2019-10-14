import React from 'react';

const [_open, _setOpen] = React.useState(false);
export const open = _open;
export const setOpen = _setOpen;

export const handleOpen = () => _setOpen(true);
export const handleClose = () => _setOpen(false);
