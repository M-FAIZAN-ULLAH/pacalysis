import React from "react";
import dynamic from "next/dynamic";
const Home = dynamic(() => import("../components/home"), {
  ssr: false,
});

function index() {
  return <Home />;
}

export default index;
