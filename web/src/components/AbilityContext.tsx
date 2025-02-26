import { createContext } from "react";
import { createContextualCan } from "@casl/react";
import { AppAbility } from "@src/config/ability";

export const AbilityContext = createContext<AppAbility>(undefined!);
export const Can = createContextualCan(AbilityContext.Consumer);
