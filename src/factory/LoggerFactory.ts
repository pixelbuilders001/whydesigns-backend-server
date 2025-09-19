import { ILoggerAdapter } from "../adapters/logger/LoggerAdapter";
import { WinstonAdapter } from "../adapters/logger/WinstonAdapter";

export class LoggerAdapterFactory {
  static getAdapter(provider: string): ILoggerAdapter {
    switch (provider) {
      case "winston":
        return WinstonAdapter.getInstance();
      default:
        throw new Error("Invalid logger provider selected");
    }
  }
}

export default LoggerAdapterFactory;
