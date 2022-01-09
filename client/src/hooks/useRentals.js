import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import TicketContract from '../../contracts/TicketContract.json';

const useRentals = () => {
  const { chainId } = useWeb3React();
  const [rentalsAddress, setRentalsAddress] = useState(null);

  useEffect(() => {
    if (chainId) {
      setRentalsAddress(TicketContract.networks[chainId]?.address);
    }
  }, [chainId]);

  return {
    rentalsAddress,
  };
};

export default useRentals;
