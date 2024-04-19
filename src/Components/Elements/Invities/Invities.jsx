import React from 'react'
import InvitiesTabs from './InvitiesTabs'
import { useHeaderTitle } from '../../../context/HeaderTitleContext';

const Invities = () => {
  const {resetHeaderTitle} = useHeaderTitle();
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  return (
    <>
    <InvitiesTabs/>
    </>
  )
}

export default Invities