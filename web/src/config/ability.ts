import { AbilityBuilder, Ability, AbilityClass } from "@casl/ability";
import { UserRole } from "@root/types/user";

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects = "User" | "Client" | "Report" | "all";

export type AppAbility = Ability<[Actions, Subjects]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export function defineAbilityFor(role: UserRole | undefined) {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

  if (role?.name === "admin") {
    can("manage", "all");
  } else {
    // הרשאות ברירת מחדל למשתמשים שאינם מנהלים
    can("read", "Client");
    can("read", "Report");
    cannot("manage", "User").because("רק מנהלים יכולים לנהל משתמשים");
  }

  return build();
}
