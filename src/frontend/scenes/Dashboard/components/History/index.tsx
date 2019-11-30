import React, { useState, useEffect, useMemo } from 'react';
import api from 'frontend/lib/api';
import HistoryTable from './HistoryTable';
import { DataRow, Data, DataToDataRow } from 'frontend/types/connection';
import useDataApi from 'frontend/hooks/use-data-api';

const useDataWsApi = (initialData: DataRow[]) => {
  const [data, setData] = useState(initialData);
  useEffect(() => {
    setData([...initialData, ...data]);
  }, [initialData]);

  useEffect(() => {
    const onMessage = (newData: any) => {
      const dataRows: Data[] = [JSON.parse(newData.data)];
      setData([...data, ...DataToDataRow(dataRows)]);
    };

    api.on('message', onMessage);
    return () => {
      api.off('message', onMessage);
    };
  }, [data]);

  return data;
};

const History = () => {
  const { data: initialData, error, isLoading, isError } = useDataApi(api.getHistory, [], []);
  const memoizedInitialData = useMemo(() => DataToDataRow(initialData), [initialData]);
  const data = useDataWsApi(memoizedInitialData);

  if (isError) {
    return (
      <>
        {'Error!'}
        {JSON.stringify(error)}
      </>
    );
  }

  if (isLoading) {
    return (<>{'Loading...'}</>);
  }


  return (
    <HistoryTable rows={data} />
  );
}

export default History;
