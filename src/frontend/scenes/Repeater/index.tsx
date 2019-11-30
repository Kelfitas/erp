import React, { useMemo, DOMElement, useEffect } from 'react';
import useDataApi from 'frontend/hooks/use-data-api';
import api from 'frontend/lib/api';
import { useSelector, useDispatch, batch } from 'react-redux';
import TabbedView, { TabsWrapperProps } from 'frontend/components/TabbedView';
import { Data } from 'frontend/types/connection';
import { TextField, makeStyles, createStyles, Theme, Divider, Grid, Typography, Tooltip, Button, Toolbar, Icon, AppBar, Box, Paper } from '@material-ui/core';
import { removeRequest, addRequest, updateRequest } from 'frontend/redux/actions/repeater';
import Editor from 'frontend/components/Editor';
import { Request } from 'frontend/redux/reducers/repeater';
import { sanitizeRequest } from 'frontend/utils/request';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: '50%',
    },
    root: {
      width: '100%',
      // border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.secondary,
      flexWrap: 'nowrap',
      alignItems: 'start',
      '& svg': {
        margin: theme.spacing(2),
      },
      '& hr': {
        margin: theme.spacing(0, 0.5),
      },
    },
    text: {
      wordBreak: 'break-word',
      whiteSpace: 'pre-line',
      width: '50%',
    },
    grid: {
      display: 'flex',
      justifyContent: 'flex-end',
      margin: theme.spacing(0, 1),
    },
    button: {
      margin: theme.spacing(1),
    }
  }),
);

interface TabProps {
  index: number;
  key: any;
  request: Request;
};

function Tab(props: TabProps) {
  const { request, index } = props;
  const dispatch = useDispatch();
  // const requests = useSelector((state: any) => state.repeater.requests);
  const [requestValue, setRequestValue] = React.useState(request.value);
  const [responseValue, setResponseValue] = React.useState('');
  const [selection, setSelection] = React.useState([0, 0]);
  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const classes = useStyles();

  useEffect(() => {
    dispatch(updateRequest(index, requestValue));
  }, [requestValue]);

  useEffect(() => {
    const [start, end] = selection;
    restoreSelection(start, end);
  }, selection);

  const getSelection = (): number[] => {
    const editor = (editorRef.current as HTMLTextAreaElement);
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    return [start, end];
  };

  const restoreSelection = (start: number, end: number): void => {
    const editor = (editorRef.current as HTMLTextAreaElement);
    editor.setSelectionRange(start, end);
  }

  const replaceSelection = (replacer: (s: string) => string) => {
    const [start, end] = getSelection();

    const pre = requestValue.substr(0, start);
    const sel = requestValue.substr(start, end - start);
    const post = requestValue.substr(end);

    const replacedSelection = replacer(sel);
    const newEnd = end + replacedSelection.length - sel.length;

    setRequestValue(pre + replacedSelection + post);
    setSelection([start, newEnd]);
  };

  const handleUrlDecodeEncode = (shouldDecode: boolean) => {
    replaceSelection((sel: string): string => {
      if (shouldDecode) {
        return decodeURIComponent(sel);
      }

      return encodeURIComponent(sel);
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequestValue(event.target.value);
  };

  const handleSubmit = (event?: React.MouseEvent<unknown>) => {
    const { id } = request;
    const value = sanitizeRequest(requestValue);
    setRequestValue(value);
    api.repeat(id, value).then((res) => {
      setResponseValue(res.data);
    }).catch(console.error);
  };

  const handleKeyDown = (event: React.KeyboardEvent<unknown>) => {
    // const { keyCode, charCode, ctrlKey, shiftKey } = event;
    // console.log('Down: ', event);
    // console.log('Down KeyCode: ', keyCode);
    // console.log('Down charCode: ', charCode);
    // console.log('Down CtrlKey: ', ctrlKey);
    // console.log('Down ShiftKey: ', shiftKey);
    // if (!ctrlKey) {
    //   return;
    // }

    // switch (keyCode) {
    //   case 13: // return
    //   case 85: // U
    //     event.preventDefault();
    //     break;
    // }
  };

  const handleKeyUp = (event: React.KeyboardEvent<unknown>) => {
    const { keyCode, charCode, altKey, ctrlKey, shiftKey } = event;
    console.log('Up: ', event);
    console.log('Up KeyCode: ', keyCode);
    console.log('Up charCode: ', charCode);
    console.log('Up AltKey: ', altKey);
    console.log('Up CtrlKey: ', ctrlKey);
    console.log('Up ShiftKey: ', shiftKey);
    if (!ctrlKey) {
      return;
    }

    switch (keyCode) {
      case 13: // return
        event.preventDefault();
        handleSubmit();
        break;
      case 85: // U
        event.preventDefault();
        handleUrlDecodeEncode(altKey);
        break;
    }
  };

  return (
    <>
      <Paper color="default">
        <Grid className={classes.grid}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            endIcon={<Icon>send</Icon>}
            onClick={handleSubmit}
          >
            Send
          </Button>
        </Grid>
      </Paper>
      <Box p={5}>
        <Grid container className={classes.root}>
          <Editor
            index={index}
            editorRef={editorRef}
            requestValue={requestValue}
            handleChange={handleChange}
            className={classes.textField}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
          <Divider orientation="vertical" />
          <Typography className={classes.text}>{responseValue}</Typography>
        </Grid>
      </Box>
    </>
  );
}

function Repeater() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const requests = useSelector((state: any) => state.repeater.requests);

  const handleTabClose = (event: React.MouseEvent<unknown>, index: number) => {
    dispatch(removeRequest(index));
  };

  return (
    <TabbedView
      includeTabCloseButton
      handleTabClose={handleTabClose}
    >
      {requests.map((request: Request, index: number) => (
        <Tab request={request} index={index} key={index} />
      ))}
    </TabbedView>
  );
};

export default Repeater;
