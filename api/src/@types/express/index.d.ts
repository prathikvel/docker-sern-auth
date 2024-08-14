import { User as AppUser } from "@/features/user";

declare global {
  namespace Express {
    interface User extends Omit<AppUser, "usrPassword"> {
      authorization: {
        entity?: string[];
        entitySet?: string[];
      } | null;
    }
  }
}
