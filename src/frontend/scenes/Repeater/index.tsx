import React, { useMemo } from 'react';
import useDataApi from 'frontend/hooks/use-data-api';
import api from 'frontend/lib/api';
import { useSelector, useDispatch } from 'react-redux';
import TabbedView from 'frontend/components/TabbedView';
import { Data } from 'frontend/types/connection';
import { TextField, makeStyles, createStyles, Theme, Divider, Grid, Typography } from '@material-ui/core';
import { removeData } from 'frontend/redux/actions/repeater';
import Editor from 'frontend/components/Editor';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: '50%',
    },
    root: {
      width: 'fit-content',
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
    }
  }),
);

interface TabProps {
  data: Data;
  index: number;
  key: any;
};

function Tab(props: any) {
  const { data, index } = props;
  const memoizedRawRequest = useMemo(() => Buffer.from(data.connection.requestBuffer.data).toString(), [data]);
  const memoizedRawResponse = useMemo(() => Buffer.from(data.connection.responseBuffer.data).toString(), [data]);
  const [requestValue, setRequestValue] = React.useState(memoizedRawRequest);
  const [responseValue, setResponseValue] = React.useState(memoizedRawResponse);
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequestValue(event.target.value);
  };

  // const

  return (
    <Grid container alignItems="center" className={classes.root}>
      <Editor
        requestValue={requestValue}
        handleChange={handleChange}
        className={classes.textField}
      />
      <Divider orientation="vertical" />
      <Typography className={classes.text}>{responseValue}</Typography>
    </Grid>
  );
}

function Repeater() {
  const dispatch = useDispatch();
  const ids = useSelector((state: any) => state.repeater.ids);
  const { data, error, isLoading, isError, setData } = useDataApi(api.getHistoryList, [ids], []);

  if (isError) {
    return ['Error!', JSON.stringify(error)];
  }

  if (isLoading) {
    return 'Loading...';
  }

  const dataList: Data[] = data;
  if (dataList.length === 0) {
    return 'There\'s nothing here :(';
  }

  const handleTabClose = (event: React.MouseEvent<unknown>, index: number) => {
    const id = dataList[index].connection.id;
    setData(dataList.filter(d => d.connection.id !== id));
    dispatch(removeData(id));
  };

  return (
    <TabbedView includeTabCloseButton handleTabClose={handleTabClose}>
      {dataList.map((data, index) => (
        <Tab data={data} index={index} key={data.connection.id} />
      ))}
    </TabbedView>
  );
};

export default Repeater;
