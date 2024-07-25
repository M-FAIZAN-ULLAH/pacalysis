import React from "react";
import dynamic from "next/dynamic";
const Test = dynamic(() => import("../components/test"), {
  ssr: false,
});

function index() {
  return <Test />;
}

export default index;
