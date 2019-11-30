import React, { RefObject, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { compose } from 'frontend/utils';
import debug from 'lib/debug';
const log = debug('components:Editor');

type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

interface Props {
  index: number;
  requestValue: string;
  handleChange?: ChangeHandler;
  onChangeHandlers?: ChangeHandler[];
  className?: string;
  editorRef?: RefObject<HTMLTextAreaElement>;
  [k: string]: any; // rest props: MUI / html / etc
}

const countMatches = (subject: string, pattern: any) => {
  return (subject.match(pattern) || []).length;
}

const Editor = (props: Props) => {
  const {
    requestValue,
    handleChange,
    onChangeHandlers,
    className,
    editorRef,
    index,
    ...rest
  } = props;

  let onChange = handleChange || console.warn;
  if (typeof onChangeHandlers === 'object' && onChangeHandlers.length > 0) {
    onChange = (e: React.ChangeEvent<HTMLInputElement>) => compose(...onChangeHandlers)(e);
  }

  log(`requestValue[${index}]: %o`, requestValue);

  return (
      <TextField
        id="standard-multiline-flexible"
        multiline
        rows={countMatches(requestValue, /\n/g) + 2}
        // rowsMax=""
        value={requestValue}
        onChange={onChange}
        margin="normal"
        className={className}
        inputRef={editorRef}
        {...rest}
      />
  );
};

export default Editor;
