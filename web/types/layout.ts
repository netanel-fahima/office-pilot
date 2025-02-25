export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  order: number;
}

export interface HeaderItem {
  id: string;
  type: "icon" | "button" | "input";
  subtype?: string;
  icon?: string;
  label?: string;
  placeholder?: string;
  order: number;
}
