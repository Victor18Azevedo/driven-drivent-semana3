import { ApplicationError } from "@/protocols";

export function paymentRequiredError(): ApplicationError {
  return {
    name: "paymentRequiredError",
    message: "Must be pay",
  };
}
