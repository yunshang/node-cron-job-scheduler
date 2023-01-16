import * as mongoose from "mongoose";
import { Test, Floor, Site, Position } from "./test.interface";
const schema = new mongoose.Schema(
  {
    code: { type: Number, required: false },
    floor: { type: String, required: false },
    message: { type: String, required: false },
    position: { type: [Number], required: false },
    site: { type: String, required: false },
    timestamp: { type: String, required: false },
    trace_id: { type: String, required: false },
    uuid: { type: String, required: false },
  },
  { collection: "tests" }
);

const testModel = mongoose.model<Test & mongoose.Document>("Test", schema);

export default testModel;
