import React from 'react';
import TextField from '@material-ui/core/TextField';

const Editor = (props: any) => {
  const { requestValue, handleChange, className } = props;
  return (
      <TextField
        id="standard-multiline-flexible"
        // label="Multiline"
        multiline
        // rowsMax=""
        value={requestValue}
        onChange={handleChange}
        margin="normal"
        className={className}
      />
  );
};

export default Editor;
