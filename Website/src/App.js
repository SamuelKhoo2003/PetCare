import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "../src/pages/HomePage";
import SignUp from "../src/pages/Signup";
// import Pricing from "../src/pages/Pricing";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  ${(props) => props.isSignUpPage && `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  `}
`;

const GlobalStyleWrapper = () => {
  const location = useLocation();
  const isSignUpPage = location.pathname === "/signup"; // Check if on SignUp page

  return <GlobalStyle isSignUpPage={isSignUpPage} />;
};

// We don't use Router here as if we have double router nesting, it will cause errors

const App = () => {
  return (
    <>
      <GlobalStyleWrapper />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        {/* <Route path="/pricing" element={<Pricing />} /> */}
      </Routes>
    </>
  );
};

export default App;
