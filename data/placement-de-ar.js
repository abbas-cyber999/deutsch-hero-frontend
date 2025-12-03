// api/placement-de-ar.js
import placementData from "../data/placement-de-ar.json";

export default function handler(req, res) {
  res.status(200).json(placementData);
}
