export interface AppConfigModel {
  [key: string]: {
    value: { minVersion?: string, forceUpdate?: string, option?: boolean, message?: string }
  };
}
