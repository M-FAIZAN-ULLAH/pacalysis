// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default function handler(req, res) {
//   res.status(200).json({ name: "John Doe" });
// }

// utils/api.js

import axios from "axios";

export const fetchData = async () => {
  const response = await axios.get(
    `http://localhost:5000/api/packets/range?id=669a34f8867bc7f321fddbd0&start=58&end=70`
  );
  return response.data.data;
};
