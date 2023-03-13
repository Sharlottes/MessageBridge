import Platform from "./Platform";

class SwitPlatform extends Platform {
  public linkPerm(platform: Platform): Promise<string> {
    throw new Error("Method not implemented.");
  }

  public async send(message: MessageData): Promise<void> {}

  public getId(): string {
    throw new Error("Method not implemented.");
  }

  public getRoomName(): string {
    throw new Error("Method not implemented.");
  }
}

export default SwitPlatform;
