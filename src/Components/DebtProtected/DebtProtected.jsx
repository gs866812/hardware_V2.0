import { useContext } from 'react';
import { ContextData } from '../../Provider';
import { useLocation } from 'react-router-dom';

const DebtProtected = ({ children }) => {
  const {user, userName, loading } = useContext(ContextData);


  if (loading) {
    // Show spinner while loading
    return (
      <div className="flex justify-center items-center lg:p-20 mt-5 lg:mt-0">
        <span className="loading loading-ring loading-lg flex justify-center items-center"></span>
      </div>
    );
  }

  if (user && (userName === "DEVELOPER" || userName === "ASAD1010" || userName === "ARIF1971")) {
    // If user is logged in, render children components
    return children;
  }

};

export default DebtProtected;
