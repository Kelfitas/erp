import { useState, useEffect } from 'react';
import { AxiosPromise } from 'axios';

type AxiosMethod = (...args: any[]) => AxiosPromise;

interface Data {
  data: any;
  error: any;
  isLoading: boolean;
  isError: boolean;
  setParams: React.Dispatch<React.SetStateAction<any[]>>;
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

const useDataApi = (apiCallFunc: AxiosMethod, apiParams: any[], initialData: any): Data => {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(apiParams);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const result = await apiCallFunc(...apiParams);
        setData(result.data);
      } catch (err) {
        setError(err);
        setIsError(true);
      }

      setIsLoading(false);
    };

    fetchData();
  }, params);

  return { data, error, isLoading, isError, setParams, setData } as Data;
};

export default useDataApi;
