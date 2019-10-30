import React from 'react';
import { useParams } from 'react-router-dom';
import useDataApi from 'frontend/hooks/use-data-api';
import api from 'frontend/lib/api';

const Repeater = () => {
  const { id } = useParams();
  const { data: connection, error, isLoading, isError } = useDataApi(api.getHistoryItem, [id], []);

  if (isError) {
    return ['Error!', JSON.stringify(error)];
  }

  if (isLoading) {
    return 'Loading...';
  }

  return JSON.stringify(connection);
};

export default Repeater;
