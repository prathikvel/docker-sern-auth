import { User as AppUser } from "@/features/user";

declare global {
  namespace Express {
    interface User extends Omit<AppUser, "usr_password"> {}
  }
}
