import { channel, subscribe } from "diagnostics_channel";
import mongoose, { Schema } from "mongoose";
import { type } from "os";

const subscriptionSchema = new Schema({
  subscribe: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: "  User"
  }
}, { timestamps: true })


export const Subscription = mongoose.model("Subscription", subscriptionSchema)